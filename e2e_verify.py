import requests
import sys
import time

BASE_URL = "http://localhost:8000"
API_KEY = "test-secret-key"

def run_e2e(pdf_path):
    print(f"Submitting {pdf_path}...")
    try:
        with open(pdf_path, "rb") as f:
            response = requests.post(
                f"{BASE_URL}/v1/parse",
                headers={"X-API-Key": API_KEY},
                files={"file": f}
            )
        
        if response.status_code != 202:
            print(f"Submission failed: {response.text}")
            sys.exit(1)
            
        job_id = response.json()["job_id"]
        print(f"Job ID: {job_id}")
        
        print("Waiting for completion...", end="", flush=True)
        while True:
            try:
                res = requests.get(f"{BASE_URL}/v1/jobs/{job_id}", headers={"X-API-Key": API_KEY})
                status = res.json()["status"]
                
                if status == "completed":
                    print("\nSuccess!")
                    import json
                    print(json.dumps(res.json()["result"], indent=2))
                    break
                elif status == "failed":
                    print(f"\nJob failed: {res.json().get('error')}")
                    sys.exit(1)
                
                print(".", end="", flush=True)
                time.sleep(2)
            except Exception as e:
                print(f"\nPolling error: {e}")
                sys.exit(1)
                
    except Exception as e:
        print(f"Error: {e}")
        sys.exit(1)

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python e2e_verify.py <pdf_path>")
        sys.exit(1)
    run_e2e(sys.argv[1])
