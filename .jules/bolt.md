## 2025-05-18 - Multi-category counting over reactive search inputs
**Learning:** Computing per-category counts on search inputs by running `searchApplications` repeatedly for each category results in $N \times (\text{Categories} + 1)$ search operations per keystroke. A single search pass yielding matching items, followed by a simple category frequency map traversal, reduces filtering passes by ~89%.
**Action:** Always count category frequencies from a single search result array rather than querying search filters per category.
