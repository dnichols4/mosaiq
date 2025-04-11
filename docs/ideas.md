# Ideas

*   This document captures possible future feature implementations. It is simply a "brainstorming" type document to capture thoughts. Do not make edits to this document unless asking first and if approved, only append to the existing doc and update a revision table at the top of the document.

## Content Taxonomy

*   Use something like one of the below systems to define a finite list of "tags" or documentation classifications 
    *   [Simple Knowledge Organization System](https://en.wikipedia.org/wiki/Simple_Knowledge_Organization_System) 
    *   [Information Coding Classification](https://en.wikipedia.org/wiki/Information_Coding_Classification) 
    *   [Universal Decimal Classification (UDC)](https://en.wikipedia.org/wiki/Universal_Decimal_Classification)
    *   [UNESCO Thesaurus](https://vocabularies.unesco.org/browser/thesaurus/en/)
*   Have a LLM automatically tag (or score? --> instead of a simple yes/no, possibly have the LLM give the content item a "score" for each tag/classification) the values for a given article using a well pre-defined prompt template and/or system prompt.
*   Allow a user to modify these values per content item and/or in batch
*   Somehow visually expose these data points to the user (like Obisdian graphs?) with the purpose of highlighting "connections" between content items and the user's "interest" in each tag/classification
*   Also possible allow the user to set preferences or "dials" for each tag/classification. These preferences could then be used to possibly rate/grade/rank each content item based on the user's potential "liking" of the content item - i.e., if I "dial" my "physics" dial to "10" (on a scale of 10), then content items with a high "physics score" should show up more frequently / get a higher rating/ranking

## Content Types

*   YouTube videos / transcripts
*   "Hand written" notes via markdown editor or "friendly" copy/paste
    *   Possibly branch off the "add content" button 1) Add URL, 2) Create Content?  Maybe better as two different options?

## ~Versioning?~

*   ~Implement git or something similar for the graphs? that are created over time.  The application should commit any changes made with relevant comments to help the user 1) be able to revert if needed, and 2) visualize changes across items and see how that relates to the graph?~
*   Not needed since the plan is to implement using a CRDT-based data model