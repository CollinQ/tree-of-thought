import requests
import dotenv
import os

dotenv.load_dotenv()

def get_profile(profile_id, token, company_id=None):
    """
    Fetch a profile from the Mercor API.
    
    Args:
        profile_id (str): The profile ID to fetch (e.g., "157e2086-e454-408b-9f29-a5c6de84b5a3")
        token (str): Authorization bearer token
        company_id (str, optional): Company ID for the X-Company-ID header
        
    Returns:
        dict: JSON response from the API
    """
    url = f"https://aws.api.mercor.com/team/mongo-profile/{profile_id}?type=shortlist"
    
    headers = {
        'accept': 'application/json, text/plain, */*',
        'accept-language': 'en-US,en;q=0.9',
        'authorization': f'Bearer {token}',
        'origin': 'https://team.mercor.com',
        'priority': 'u=1, i',
        'referer': 'https://team.mercor.com/',
        'sec-ch-ua': '"Not(A:Brand";v="99", "Google Chrome";v="133", "Chromium";v="133"',
        'sec-ch-ua-mobile': '?0',
        'sec-ch-ua-platform': '"macOS"',
        'sec-fetch-dest': 'empty',
        'sec-fetch-mode': 'cors',
        'sec-fetch-site': 'same-site',
        'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36'
    }
    
    # Add company_id to headers if provided
    if company_id:
        headers['x-company-id'] = company_id
    
    response = requests.get(url, headers=headers)
    
    # Raise an exception for 4XX/5XX responses
    response.raise_for_status()
    
    return response.json()

# Example usage:
if __name__ == "__main__":
    # Your authorization token (should be stored securely, not hardcoded)
    token = os.environ.get("MERCOR_BEARER_TOKEN")
    
    # Company ID
    company_id = "company_AAABlBcKSES__LtmK8ZEFavq"
    
    # Profile ID to fetch
    profile_id = "157e2086-e454-408b-9f29-a5c6de84b5a3"
    
    try:
        profile_data = get_profile(profile_id, token, company_id)
        print(f"Successfully fetched profile data: {profile_data}")
    except requests.exceptions.HTTPError as err:
        print(f"HTTP Error: {err}")
    except Exception as err:
        print(f"Error: {err}")