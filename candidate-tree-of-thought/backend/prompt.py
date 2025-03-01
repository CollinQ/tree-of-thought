def get_prompt(candidate_a_transcript, candidate_b_transcript, candidate_a_experience, candidate_b_experience, job_description):
    return f"""
        Imagine you're the hiring manager for the role of "Quantum Infrastructure Architect" at a cutting-edge tech company working on the intersection of quantum computing and artificial intelligence. You need to evaluate two final candidates with unconventional backgrounds for this highly specialized position.

        Candidate A
        Background:
        {candidate_a_experience}
        Interview Performance:
        {candidate_a_transcript}

        Candidate B
        Background:
        {candidate_b_experience}
        Interview Performance:
        {candidate_b_transcript}

        The Challenge:
        {job_description}

        Please provide a comprehensive analysis of the strengths and weaknesses of each candidate relative to these requirements, and make a final recommendation with detailed justification.
    """