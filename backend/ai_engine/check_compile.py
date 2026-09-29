import qai_hub as hub

JOB_ID = "jg9zooolp"

print("Retrieving SnapGuard X compilation job...")
print("----------------------------------------")

job = hub.get_job(JOB_ID)

print("\nJob ID:")
print(job.job_id)

print("\nJob Type:")
print(job.job_type)

print("\nCompilation Status:")
print(job.get_status())

print("\nAvailable Artifacts:")
print(job.get_available_artifacts())