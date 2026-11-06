# Cartoon quiz videos

Templates 8 and 9 are the original cartoon quizzes, not stock-video backgrounds.

- **How well do you know your girlfriend** uses `cartoon-quiz/scripts/recreate_reference_v15.py`. Soft blue background, outlined Playfair type, the hugging couple, square illustrations, and the pink stopwatch. The delivered file is `data/cartoon-originals/how-well-girlfriend-v15.mp4`.
- **Quiz your girlfriend** uses `cartoon-quiz/scripts/recreate_reference_v5b.py`. Same design. Hook is “Quiz your girlfriend!”, then “Boys, send this to her.” Questions are about him. The delivered file is `data/cartoon-originals/quiz-girlfriend-v5b.mp4`.

Opening either template plays the saved MP4. The phone library at `/library` lists the same files. Download does not delete. A one-time seed marker in Mongo (`videoLibraryMeta` / `cartoon-originals-v1`) stops a refresh from putting a deleted original back.

The daily GitHub workflows render the same Python pipeline with Kokoro `af_heart` and a rotating question set that keeps each illustration on the same topic. They need `BLOB_READ_WRITE_TOKEN` and `MONGODB_URI` as Actions secrets. They do not use Pexels.

Voice models, if a line is not already cached:

- https://github.com/thewh1teagle/kokoro-onnx/releases/download/model-files-v1.0/kokoro-v1.0.onnx
- https://github.com/thewh1teagle/kokoro-onnx/releases/download/model-files-v1.0/voices-v1.0.bin
