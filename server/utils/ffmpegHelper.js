import ffmpeg from 'fluent-ffmpeg';
import path from 'path';
import fs from 'fs';

/**
 * Gets the duration of a video file in seconds using ffprobe.
 * @param {string} inputPath - Absolute path to the video file
 * @returns {Promise<number>} - Duration in seconds (0 if undetectable)
 */
export const getVideoDuration = (inputPath) => {
    return new Promise((resolve) => {
        ffmpeg.ffprobe(inputPath, (err, metadata) => {
            if (err || !metadata?.format?.duration) {
                console.warn('⚠️  Could not extract video duration:', err?.message);
                resolve(0);
            } else {
                resolve(Math.round(metadata.format.duration));
            }
        });
    });
};

/**
 * Transcodes a local .mp4 file into HLS segments (.m3u8 + .ts chunks).
 * @param {string} inputPath   - Absolute path to the source .mp4 file
 * @param {string} outputDir   - Directory where HLS files will be written
 * @returns {Promise<{ playlistPath: string, durationSeconds: number }>}
 */
export const transcodeToHLS = async (inputPath, outputDir) => {
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
    }

    // Extract duration before transcoding
    const durationSeconds = await getVideoDuration(inputPath);

    const playlistPath = path.join(outputDir, 'playlist.m3u8');

    await new Promise((resolve, reject) => {
        ffmpeg(inputPath)
            .addOptions([
                '-profile:v baseline',
                '-level 3.0',
                '-start_number 0',
                '-hls_time 6',           // 6-second segments
                '-hls_list_size 0',      // Keep all segments in playlist
                '-hls_segment_filename', path.join(outputDir, 'segment%03d.ts'),
                '-f hls',
            ])
            .output(playlistPath)
            .on('end', () => {
                console.log('✅ FFmpeg HLS transcode complete');
                resolve();
            })
            .on('error', (err) => {
                console.error('❌ FFmpeg error:', err.message);
                reject(err);
            })
            .run();
    });

    return { playlistPath, durationSeconds };
};
