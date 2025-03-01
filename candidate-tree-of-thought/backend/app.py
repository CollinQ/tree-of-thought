import json
from collections import Counter
from ai import AnthropicService
from graphviz import Digraph
from flask import Flask, request, jsonify
import pytest
from prompt import get_prompt  # Import the get_prompt function

class ThoughtNode:
    def __init__(self, thought, children=None):
        self.thought = thought
        self.children = children or []
        self.winner = None  # Store the winning candidate at this node (leaf only)

class TreeOfThought:
    def __init__(
        self,
        root_prompt,
        candidates=None,
        candidate_transcripts=None,
        candidate_experiences=None,
        job_description=None,
        ai_service=None,
        max_iterations=3,
        max_tokens=250
    ):
        """
        :param root_prompt: The initial prompt or thought to start from.
        :param candidates: A list of candidate names.
        :param candidate_transcripts: A dictionary of candidate transcripts.
        :param candidate_experiences: A dictionary of candidate experiences.
        :param job_description: The job description for the role.
        :param ai_service: Optional custom AI service; defaults to AnthropicService().
        :param max_iterations: Number of iterative expansions of the tree.
        :param max_tokens: Max tokens for the LLM responses.
        """
        self.root = ThoughtNode(root_prompt)
        self.max_iterations = max_iterations
        self.ai_service = ai_service or AnthropicService()
        self.current_thoughts = [self.root]
        self.max_tokens = max_tokens
        self.candidates = candidates if candidates else []
        self.candidate_transcripts = candidate_transcripts if candidate_transcripts else {}
        self.candidate_experiences = candidate_experiences if candidate_experiences else {}
        self.job_description = job_description
    
    def call_llm(self, prompt):
        """
        Safely call the LLM and parse JSON.
        Expecting well-formed JSON from the LLM. If invalid, returns None or empty structures.
        """
        try:
            response = self.ai_service.generate_response(prompt, max_tokens=self.max_tokens)
            if not response:
                print("Received empty response from AI service.")
                return None

            # Check if the response is a string that looks like a JSON list
            if isinstance(response, str) and response.strip().startswith('[') and response.strip().endswith(']'):
                return json.loads(response.strip())
            
            # Attempt to parse JSON from the LLM response
            return json.loads(response)
        except json.JSONDecodeError as e:
            print(f"JSON decoding error: {e}")
            print("response w error ", response)
            print("\n\n\n\n\n\n")
            return None
        except Exception as e:
            print(f"Error calling LLM or parsing JSON: {e}")
            return None

    def explore_thoughts(self, thought_nodes):
        """
        For each current thought, ask the LLM to generate new sub-thoughts (in JSON list form).
        Returns a list of newly created ThoughtNodes.
        """
        new_thought_nodes = []
        for thought_node in thought_nodes:
            # We'll ask the LLM to provide sub-thoughts in a JSON list
            prompt_dict = {
                "current_thought": thought_node.thought,
                "task": "Provide two concise, evolved next thoughts in a JSON list. You must only output the list and nothing else. Example: [\"thought1\", \"thought2\"]"
            }
            prompt = json.dumps(prompt_dict)

            response = self.call_llm(prompt)
            # We expect a JSON list of strings
            if isinstance(response, list):
                for new_thought in response:
                    if isinstance(new_thought, str):
                        child_node = ThoughtNode(new_thought)
                        thought_node.children.append(child_node)
                        new_thought_nodes.append(child_node)
        return new_thought_nodes

    def evaluate_winner(self, thought_node):
        """
        At a leaf node, we ask the LLM to pick the winning candidate from self.candidates.
        The LLM should return a JSON object: {"winner": "CandidateA"}
        """
        prompt_dict = {
            "leaf_thought": thought_node.thought,
            "candidates": self.candidates,
            "candidate_transcripts": self.candidate_transcripts,
            "candidate_experiences": self.candidate_experiences,
            "job_description": self.job_description,
            "task": (
                "Based on the leaf_thought, candidate transcripts, experiences, and job description, "
                "choose the single best candidate. Return a JSON object with the key 'winner' set to the chosen candidate's name. Only output the winner, either Candidate A or Candidate B. Do not add any other text."
                "Example: {\"winner\": \"Candidate A\"}"
            )
        }
        prompt = json.dumps(prompt_dict)

        response = self.call_llm(prompt)

        if isinstance(response, dict) and "winner" in response:
            thought_node.winner = response["winner"]
        else:
            thought_node.winner = None  # If we can't parse, no winner assigned

    def determine_leaf_winners(self, node):
        """
        Recursively traverse the tree. For each leaf node, call evaluate_winner, then collect the result.
        """
        if not node.children:  # It's a leaf
            self.evaluate_winner(node)
            return [node.winner] if node.winner else []
        
        winners = []
        for child in node.children:
            winners.extend(self.determine_leaf_winners(child))
        return winners

    def run(self):
        """
        1. Expand the tree up to max_iterations.
        2. Evaluate winners at each leaf.
        3. Perform a majority vote for final decision.
        """
        # Expand the tree
        for iteration in range(self.max_iterations):
            print(f"Iteration {iteration + 1}:")
            self.current_thoughts = self.explore_thoughts(self.current_thoughts)
            for thought_node in self.current_thoughts:
                print(f"Explored Thought: {thought_node.thought} \n")

        # After expansions, get winners from leaf nodes
        leaf_winners = self.determine_leaf_winners(self.root)

        # Tally results
        if leaf_winners:
            counter = Counter(leaf_winners)
            # Sort by frequency (descending), pick the top
            final_winner, votes = counter.most_common(1)[0]
            print("=" * 80)
            print(f"Leaf Winners: {leaf_winners}")
            print(f"Majority Vote: {counter}")
            print(f"Final Decision: {final_winner} with {votes} votes.")
        else:
            print("No leaf winners determined.")

    def print_tree(self, node, level=0):
        """
        Simple console print of the entire tree, including winners at leaf nodes.
        """
        indent = '  ' * level
        print(f"{indent}- Thought: {node.thought}")
        if node.winner:
            print(f"{indent}  [Winner: {node.winner}]")
        for child in node.children:
            self.print_tree(child, level+1)


def load_prompt_from_file(file_path="prompt.txt"):
    try:
        with open(file_path, 'r', encoding='utf-8') as file:
            return file.read()
    except FileNotFoundError:
        print(f"File '{file_path}' not found.")
        return None
    except Exception as e:
        print(f"Error reading file '{file_path}': {e}")
        return None


app = Flask(__name__)

@app.route('/evaluate_candidates', methods=['POST'])
def evaluate_candidates():
    data = request.json
    candidates = data.get('candidates', [])
    candidate_transcripts = data.get('candidate_transcripts', {})
    candidate_experiences = data.get('candidate_experiences', {})
    job_description = data.get('job_description', "")

    # Use get_prompt to generate the root_prompt
    root_prompt = get_prompt(
        candidate_a_transcript=candidate_transcripts.get("Candidate A", ""),
        candidate_b_transcript=candidate_transcripts.get("Candidate B", ""),
        candidate_a_experience=candidate_experiences.get("Candidate A", ""),
        candidate_b_experience=candidate_experiences.get("Candidate B", ""),
        job_description=job_description
    )

    tot = TreeOfThought(
        root_prompt=root_prompt,
        candidates=candidates,
        candidate_transcripts=candidate_transcripts,
        candidate_experiences=candidate_experiences,
        job_description=job_description
    )
    tot.run()
    return jsonify({"message": "Evaluation complete. Check server logs for details."})

def read_file(file_path):
    with open(file_path, 'r', encoding='utf-8') as file:
        return file.read()

def run_test():
    app.testing = True
    with app.test_client() as client:
        # Load sample data from files
        candidate_a_experience = read_file('test-data/candidate_a_experience.txt')
        candidate_a_transcript = read_file('test-data/candidate_a_transcript.txt')
        candidate_b_experience = read_file('test-data/candidate_b_experience.txt')
        candidate_b_transcript = read_file('test-data/candidate_b_transcript.txt')
        job_description = read_file('test-data/job_description.txt')

        # Prepare the data payload
        data = {
            "root_prompt": "We have two unconventional candidates for a specialized role...",
            "candidates": ["Candidate A", "Candidate B"],
            "candidate_transcripts": {
                "Candidate A": candidate_a_transcript,
                "Candidate B": candidate_b_transcript
            },
            "candidate_experiences": {
                "Candidate A": candidate_a_experience,
                "Candidate B": candidate_b_experience
            },
            "job_description": job_description
        }

        # Send POST request to the endpoint
        response = client.post('/evaluate_candidates', data=json.dumps(data), content_type='application/json')

        # Assert the response
        assert response.status_code == 200
        assert response.json == {"message": "Evaluation complete. Check server logs for details."}
        print("Test passed!")

if __name__ == "__main__":
    run_test()
