find . -type f -name "*.mp4" | while read file; do                                               
  ffmpeg -i "$file" -vn -c:a libmp3lame -b:a 128k "${file%.*}.mp3"          
done
