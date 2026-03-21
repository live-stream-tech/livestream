import React, { createContext, useContext, useState, useCallback, useRef } from "react";

export type PlayingVideo = {
  videoId: number;
  title: string;
  thumbnail: string;
  youtubeId?: string | null;
  videoUrl?: string | null;
} | null;

const PlayingVideoContext = createContext<{
  playing: PlayingVideo;
  setPlaying: (v: PlayingVideo) => void;
  playVideo: (v: Omit<NonNullable<PlayingVideo>, "videoId"> & { videoId: number }) => void;
  stopPlaying: () => void;
  jukeboxIsActive: boolean;
  setJukeboxIsActive: (v: boolean) => void;
  /** GlobalJukeboxPlayer が保持する YouTube IFrame インスタンス（全体で共有） */
  ytPlayerRef: React.MutableRefObject<any>;
  /** IFrame を格納する DOM コンテナ（React ツリー外に配置） */
  ytContainerRef: React.MutableRefObject<HTMLDivElement | null>;
  /** iOS Safari 対応: ミュート状態（初期は true、ユーザーのタップでミュート解除） */
  isMuted: boolean;
  setIsMuted: (v: boolean) => void;
  /** ユーザーのタップでミュート解除 */
  unmutePlayer: () => void;
}>({
  playing: null,
  setPlaying: () => {},
  playVideo: () => {},
  stopPlaying: () => {},
  jukeboxIsActive: false,
  setJukeboxIsActive: () => {},
  ytPlayerRef: { current: null },
  ytContainerRef: { current: null },
  isMuted: true,
  setIsMuted: () => {},
  unmutePlayer: () => {},
});

export function PlayingVideoProvider({ children }: { children: React.ReactNode }) {
  const [playing, setPlaying] = useState<PlayingVideo>(null);
  const [jukeboxIsActive, setJukeboxIsActive] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const ytPlayerRef = useRef<any>(null);
  const ytContainerRef = useRef<HTMLDivElement | null>(null);

  const playVideo = useCallback((v: Omit<NonNullable<PlayingVideo>, "videoId"> & { videoId: number }) => {
    setPlaying((prev) => {
      if (prev?.videoId === v.videoId && prev?.youtubeId === v.youtubeId && prev?.videoUrl === v.videoUrl) {
        return prev;
      }
      return v;
    });
  }, []);

  const stopPlaying = useCallback(() => setPlaying(null), []);

  const unmutePlayer = useCallback(() => {
    if (ytPlayerRef.current) {
      try {
        ytPlayerRef.current.unMute?.();
        ytPlayerRef.current.setVolume?.(100);
      } catch { /* ignore */ }
    }
    setIsMuted(false);
  }, []);

  return (
    <PlayingVideoContext.Provider value={{ playing, setPlaying, playVideo, stopPlaying, jukeboxIsActive, setJukeboxIsActive, ytPlayerRef, ytContainerRef, isMuted, setIsMuted, unmutePlayer }}>
      {children}
    </PlayingVideoContext.Provider>
  );
}

export function usePlayingVideo() {
  return useContext(PlayingVideoContext);
}
