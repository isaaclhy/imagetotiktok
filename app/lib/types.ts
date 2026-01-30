export interface CanvasData {
  id: string;
  text: string;
  backgroundColor: string;
  textColor: string;
  textSize: string;
  imageSize: string;
}

export interface CreatorInfo {
  privacy_level_options?: string[];
  comment_disabled?: boolean;
  duet_disabled?: boolean;
  stitch_disabled?: boolean;
  max_video_post_duration_sec?: number;
}
