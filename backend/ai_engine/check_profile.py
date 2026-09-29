import qai_hub as hub

JOB_ID = "jgzlzyr45"

print("Checking SnapGuard X profiling job...")
print("--------------------------------------")

job = hub.get_job(JOB_ID)

print("\nJob ID:")
print(job.job_id)

print("\nJob Type:")
print(job.job_type)

print("\nProfiling Status:")
print(job.get_status())

print("\nAvailable Artifacts:")
print(job.get_available_artifacts())