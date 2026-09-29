import os
import qai_hub

JOB_ID = "jgzlzyr45"

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
OUTPUT_DIR = os.path.join(BASE_DIR, "profile_results")

os.makedirs(OUTPUT_DIR, exist_ok=True)

print("Retrieving SnapGuard X profiling results...")
print("--------------------------------------------")

job = qai_hub.get_job(JOB_ID)

print("\nJob ID:")
print(job.job_id)

print("\nStatus:")
print(job.get_status())

print("\nAvailable artifacts:")
print(job.get_available_artifacts())

# ---------------------------------------------------------
# Download profile artifacts
# ---------------------------------------------------------

print("\nDownloading profile artifacts...")
print("Output directory:")
print(OUTPUT_DIR)

try:
    result = job.download_results(OUTPUT_DIR)

    print("\nProfile artifacts downloaded successfully!")
    print(result)

except Exception as e:
    print("\nError downloading profile artifacts:")
    print(type(e).__name__)
    print(e)


# ---------------------------------------------------------
# Download job logs
# ---------------------------------------------------------

print("\nDownloading job logs...")

LOG_DIR = os.path.join(OUTPUT_DIR, "logs")
os.makedirs(LOG_DIR, exist_ok=True)

try:
    result = job.download_job_logs(LOG_DIR)

    print("\nJob logs downloaded successfully!")
    print(result)

except Exception as e:
    print("\nError downloading job logs:")
    print(type(e).__name__)
    print(e)


# ---------------------------------------------------------
# List downloaded files
# ---------------------------------------------------------

print("\nDownloaded files:")
print("-----------------")

for root, dirs, files in os.walk(OUTPUT_DIR):
    for filename in files:
        filepath = os.path.join(root, filename)
        print(filepath)

print("\nDone.")