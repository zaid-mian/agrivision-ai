# AgriVision AI — Enterprise Precision Agriculture Platform Demo

## Say

1. "Every year, crop diseases destroy up to forty percent of agricultural yields before farmers can consult a specialist."
2. "AgriVision AI bridges this critical gap. It is an enterprise-grade precision agriculture platform powered by real-time edge deep learning and an explainable agronomy engine."
3. "Entering the platform as a verified model farmer, the central command center instantly loads."
4. "Farm managers and agronomists can track active field health index scores, monitor recent diagnostic scans, and review crop risk indicators in real time."
5. "Let's see the core diagnosis workflow in action. We upload a symptomatic field leaf specimen and trigger an AI diagnostic scan."
6. "Instead of relying on a slow remote cloud server, our custom MobileNetV3 deep learning model executes locally on the CPU in under fifty milliseconds."
7. "It accurately detects Tomato Late Blight with eighty-eight percent confidence, providing a full breakdown of the top three probabilistic classifications."
8. "Unlike traditional black-box AI, AgriVision provides explainable diagnostics."
9. "By toggling the neural attention heatmap, farmers can visually verify the exact necrotic lesion regions that guided the model's prediction."
10. "The platform immediately pairs this with actionable chemical and organic treatment regimens."
11. "When growers have specific questions in the field, AgriVision provides a bilingual semantic RAG assistant."
12. "Backed by a high-speed BM25 knowledge engine indexing official agronomy handbooks, it retrieves certified spraying schedules, fungicide dosages, and preventive guidance in just three milliseconds."
13. "Every diagnostic scan automatically syncs into official field reports, ready to download as a verified certification report for agricultural extension services and crop insurance."
14. "AgriVision AI puts instant, reliable agronomy expertise right into farmers' hands."

## Show

1. Open login page at `http://localhost:3000/#/login`. Settle.
2. Focus the "Explore Live Demo as Model Farmer" button.
3. Click demo login — transitions into the Dashboard.
4. Wide — Dashboard loads. Focus on Farm Health Index (84% Optimal) and Recent Scans telemetry.
5. Click Disease Detection in the sidebar. Settle.
6. Focus the specimen upload dropzone. Upload the real test leaf image (`app/uploads/leaf-1781288230956-797817476.jpg`).
7. Image preview appears with specimen name. Focus the "Detect Disease" button.
8. Click "Detect Disease" — show real neural inference loading state.
9. Results appear! Focus on the diagnostic result card: 48ms CPU inference badge and Tomato Late Blight (88% confidence).
10. Focus on the Top-3 Class Probabilities breakdown bars.
11. Click "AI Attention Map" toggle button on the leaf preview card to reveal the thermal lesion heatmap overlay. Hold for visual payoff.
12. Click "AI Assistant" in sidebar. Settle on the RAG Assistant chat interface.
13. Focus the question input. Type "What is the recommended fungicide treatment for Tomato Late Blight during wet weather?"
14. Click Send. Real BM25 semantic RAG search executes.
15. Focus the assistant's response: 3ms BM25 retrieval badge, official handbook citations, and fungicide spray dosage guidance.
16. Click "Field Reports" in the sidebar. Focus the recent certified diagnostic reports.
17. Wide — full platform payoff with macos-dark frame and rice terraces wallpaper. Hold 3.5s.
