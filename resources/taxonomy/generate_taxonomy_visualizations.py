import json
from pyvis.network import Network
import os

# Load taxonomy JSON-LD file
with open("custom_knowledge_taxonomy.json", "r", encoding="utf-8") as f:
    data = json.load(f)

graph = data["@graph"]
id_to_label = {item["@id"]: item["skos:prefLabel"] for item in graph if "skos:prefLabel" in item}

# Get top-level categories
scheme = next(item for item in graph if item["@type"] == "skos:ConceptScheme")
top_level_ids = [c["@id"] for c in scheme["skos:hasTopConcept"]]

# Create a network per top-level category
for top_id in top_level_ids:
    top_label = id_to_label[top_id]
    net = Network(height="750px", width="100%", directed=True)
    net.force_atlas_2based()

    visited = set()
    queue = [top_id]

    while queue:
        current = queue.pop(0)
        current_label = id_to_label.get(current, current)
        net.add_node(current, label=current_label)
        visited.add(current)

        current_item = next((item for item in graph if item["@id"] == current), None)
        if current_item and "skos:narrower" in current_item:
            for child in current_item["skos:narrower"]:
                child_id = child["@id"]
                child_label = id_to_label.get(child_id, child_id)
                net.add_node(child_id, label=child_label)
                net.add_edge(current, child_id)
                if child_id not in visited:
                    queue.append(child_id)
                    visited.add(child_id)

    safe_label = top_label.lower().replace(" ", "_")
    filename = f"{safe_label}_taxonomy.html"
    net.save_graph(filename)
    print(f"Saved: {filename}")
