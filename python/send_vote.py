#!/usr/bin/env python3
import requests

# Change this URL to your app
BASE_URL = "https://satisfaction-omega.vercel.app/"
# BASE_URL = "http://localhost:3001"  # For local development

def send_vote(device_id, vote_value):
    """Send a vote to the API"""
    url = f"{BASE_URL}/api/votes"
    data = {
        "deviceId": device_id,
        "voteValue": vote_value
    }
    
    response = requests.post(url, json=data)
    
    if response.status_code == 201:
        print(f"✅ Vote {vote_value} sent successfully!")
    else:
        print(f"❌ Error: {response.status_code} - {response.text}")

def create_device(name):
    """Create a new device"""
    url = f"{BASE_URL}/api/votes"
    data = {
        "action": "createDevice",
        "deviceName": name
    }
    
    response = requests.post(url, json=data)
    
    if response.status_code == 201:
        device = response.json()
        print(f"✅ Device '{name}' created! ID: {device['id']}")
        return device['id']
    else:
        print(f"❌ Error: {response.status_code} - {response.text}")
        return None

# Example usage
if __name__ == "__main__":
    # Create a test device
    # device_id = create_device("Test Device")
    device_id = 'bb7d4846-6333-11f0-9f7e-1369f2cbf416'
    
    if device_id:
        # Send some votes
        send_vote(device_id, 5)
        send_vote(device_id, 4)
        send_vote(device_id, 3)
        print(f"Check your dashboard: {BASE_URL}")