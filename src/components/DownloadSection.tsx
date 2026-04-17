interface Props {
  videoURL: string;
  thumbnailURL: string;
  storyTitle: string;
}

export default function DownloadSection({ videoURL, thumbnailURL, storyTitle }: Props) {
  const slug = storyTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 40);

  return (
    <div className="card section-card">
      <div className="section-header">
        <div className="section-title-group">
          <span className="section-icon">✅</span>
          <div className="section-label">
            <h3>Your Video is Ready!</h3>
            <span>Download and upload to YouTube</span>
          </div>
        </div>
      </div>
      <div className="section-body download-body">
        <div className="download-grid">
          <div className="download-item">
            <video src={videoURL} controls style={{ width: '100%', borderRadius: '8px' }} />
            <a className="generate-btn" href={videoURL} download={`${slug}.mp4`}>
              ⬇ Download MP4
            </a>
          </div>
          <div className="download-item">
            <img src={thumbnailURL} alt="Thumbnail" style={{ width: '100%', borderRadius: '8px' }} />
            <a className="generate-btn secondary-btn" href={thumbnailURL} download={`${slug}-thumbnail.jpg`}>
              ⬇ Download Thumbnail
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
