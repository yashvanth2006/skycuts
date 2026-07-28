import ffmpeg from 'fluent-ffmpeg';
import path from 'path';
import fs from 'fs';

/**
 * Transcodes a local .mp4 file into HLS segments (.m3u8 + .ts chunks).
 * @param {string} inputPath   - Absolute path to the source .mp4 file
 * @param {string} outputDir   - Directory where HLS files will be written
 * @returns {Promise<string>}  - Resolves with absolute path to the .m3u8 playlist
 */
export const transcodeToHLS = (inputPath, outputDir) => {
    return new Promise((resolve, reject) => {
        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true });
        }

        const playlistPath = path.join(outputDir, 'playlist.m3u8');

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
                resolve(playlistPath);
            })
            .on('error', (err) => {
                console.error('❌ FFmpeg error:', err.message);
                reject(err);
            })
            .run();
    });
};
