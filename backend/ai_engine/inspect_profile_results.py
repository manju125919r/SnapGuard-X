import os
import json

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
RESULTS_DIR = os.path.join(BASE_DIR, "profile_results")

print("SnapGuard X - Qualcomm AI Hub Profile Inspection")
print("=" * 55)

# --------------------------------------------------
# Find JSON result file
# --------------------------------------------------

json_files = [
    f for f in os.listdir(RESULTS_DIR)
    if f.lower().endswith(".json")
]

if not json_files:
    print("\n❌ No JSON profile result found.")
    print("Expected directory:")
    print(RESULTS_DIR)
    raise SystemExit(1)

json_path = os.path.join(RESULTS_DIR, json_files[0])

print("\nProfile JSON:")
print(json_path)

# --------------------------------------------------
# Load JSON
# --------------------------------------------------

try:
    with open(json_path, "r", encoding="utf-8") as f:
        data = json.load(f)
except Exception as e:
    print("\n❌ Could not read JSON:")
    print(type(e).__name__)
    print(e)
    raise SystemExit(1)

# --------------------------------------------------
# Display JSON structure
# --------------------------------------------------

print("\nTop-level JSON keys:")
print("-" * 30)

if isinstance(data, dict):
    for key in data.keys():
        print(key)
else:
    print("JSON root is:", type(data).__name__)

# --------------------------------------------------
# Pretty print important information
# --------------------------------------------------

print("\nProfile Result:")
print("-" * 30)

if isinstance(data, dict):

    # Recursively search for interesting metrics
    interesting_keywords = [
        "inference",
        "memory",
        "compute",
        "npu",
        "gpu",
        "cpu",
        "backend",
        "runtime",
        "device",
        "latency",
        "execution",
        "layer",
    ]

    def inspect_dict(obj, path=""):
        if isinstance(obj, dict):
            for key, value in obj.items():

                current_path = f"{path}.{key}" if path else key

                key_lower = str(key).lower()

                if any(word in key_lower for word in interesting_keywords):
                    print(f"\n{current_path}:")
                    print(value)

                inspect_dict(value, current_path)

        elif isinstance(obj, list):
            for index, item in enumerate(obj):
                inspect_dict(item, f"{path}[{index}]")

    inspect_dict(data)

# --------------------------------------------------
# Runtime logs
# --------------------------------------------------

print("\n\nRuntime Logs")
print("=" * 55)

logs_dir = os.path.join(RESULTS_DIR, "logs")

if os.path.exists(logs_dir):

    log_files = [
        f for f in os.listdir(logs_dir)
        if f.lower().endswith(".log")
    ]

    if not log_files:
        print("No log files found.")

    for log_file in log_files:

        log_path = os.path.join(logs_dir, log_file)

        print("\nLog file:")
        print(log_path)

        try:
            with open(
                log_path,
                "r",
                encoding="utf-8",
                errors="ignore"
            ) as f:
                lines = f.readlines()

            print(f"Total lines: {len(lines)}")

            # Search for useful technical terms
            keywords = [
                "NPU",
                "npu",
                "HTP",
                "backend",
                "Backend",
                "QNN",
                "qnn",
                "Hexagon",
                "hexagon",
                "execution",
                "inference",
                "latency",
                "memory",
                "device",
                "Snapdragon",
                "snapdragon",
            ]

            print("\nRelevant log lines:")
            print("-" * 40)

            found = 0

            for line in lines:
                if any(keyword in line for keyword in keywords):
                    print(line.rstrip())
                    found += 1

                    # Avoid flooding terminal
                    if found >= 100:
                        print("\n... more lines omitted ...")
                        break

            if found == 0:
                print("No matching technical lines found.")

        except Exception as e:
            print("Could not read log:")
            print(type(e).__name__)
            print(e)

else:
    print("Logs directory not found:")
    print(logs_dir)

# --------------------------------------------------
# Final summary
# --------------------------------------------------

print("\n\nInspection Complete")
print("=" * 55)

print("Profile results directory:")
print(RESULTS_DIR)

print("\nUse the output above to verify:")
print("1. Snapdragon target")
print("2. NPU/backend information")
print("3. Inference latency")
print("4. Memory usage")
print("5. Compute units")
print("6. Qualcomm/QNN execution details")