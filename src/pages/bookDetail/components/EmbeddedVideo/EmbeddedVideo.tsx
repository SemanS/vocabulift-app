import React, {
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import { Snapshot } from "@/models/snapshot.interfaces";
import { useNavigate, useParams } from "react-router-dom";
import { getLibraryItem } from "@/services/libraryService";
import { calculatePage } from "@/utils/stringUtils";
import { LibraryItem, SnapshotInfo } from "@/models/libraryItem.interface";
import { socket } from "@/messaging/socket";
import { useCookies } from "react-cookie";
import { getUser } from "@/services/userService";
import { User } from "@/models/user";
import styles from "./index.module.less";

declare const YT: any;
declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: () => void;
  }
}

export interface ExposedFunctions {
  playVideo: () => void;
  pauseVideo: () => void;
}

interface EmbeddedVideoProps {
  onHighlightedSubtitleIndexChange?: (index: number | null) => void;
  onHighlightedWordIndexChange?: (index: number | null) => void;
  sentencesPerPage: number;
  handlePageChange: (
    page: number,
    pageSize: number,
    changeTriggeredByHighlightChange?: boolean,
    changeTriggeredFromVideo?: boolean,
    changeTriggeredFromVideoFetch?: boolean,
    time?: number
  ) => void;
  snapshots: Snapshot[] | null | undefined;
  shouldSetVideo: boolean;
  setShouldSetVideo: (shouldSetVideo: boolean) => void;
  firstIndexAfterReset: number | null;
  setLoadingFromFetch: (loadingFromFetch: boolean) => void;
  onPlay?: () => void;
  onPause?: () => void;
  libraryItem?: any;
}

const EmbeddedVideo = React.forwardRef<ExposedFunctions, EmbeddedVideoProps>(
  (props, ref) => {
    const {
      onHighlightedSubtitleIndexChange,
      onHighlightedWordIndexChange,
      sentencesPerPage,
      handlePageChange,
      snapshots,
      shouldSetVideo,
      setShouldSetVideo,
      firstIndexAfterReset,
      setLoadingFromFetch,
      onPlay,
      onPause,
      libraryItem,
    } = props;

    const { libraryId } = useParams();
    const playerDivRef = useRef<HTMLDivElement>(null);
    const playerRef = useRef<any>(null);
    const currentPageToUseRef = useRef<number | null>(null);
    const sentencesPerPageRef = useRef(sentencesPerPage);
    const snapshotsRef = useRef<Snapshot[] | null | undefined>(null);
    const [isInitRender, setIsInitRender] = useState(true);
    const startIndexRef = useRef<number | null>(null);
    const endIndexRef = useRef<number | null>(null);
    const intervalId = React.useRef<NodeJS.Timeout>();
    const [hasVideoPaused, setHasVideoPaused] = useState(true);
    const hasSeekHappenedRef = useRef(false);
    const isMounted = useRef(true);

    const [cookies] = useCookies(["access_token"]);
    let timeoutId: number | null = null;

    const [currentLibrary, setCurrentLibrary] = useState<LibraryItem | null>();
    const [currentUser, setCurrentUser] = useState<User | null>();
    const [isVideoPaused, setIsVideoPaused] = useState(false);
    const navigate = useNavigate();
    function closeView() {
      navigate("/library");
    }

    useEffect(() => {
      // When the component unmounts, set isMounted to false
      return () => {
        isMounted.current = false;
      };
    }, []);

    useImperativeHandle(ref, () => ({
      playVideo: () => {
        if (playerRef.current && playerRef.current.playVideo) {
          playerRef.current.playVideo();
          onPlay && onPlay();
        }
      },
      pauseVideo: () => {
        if (playerRef.current && playerRef.current.pauseVideo) {
          playerRef.current.pauseVideo();
          onPause && onPause();
        }
      },
      seekTo(newTime, playAfterSeeking) {
        playerRef.current.seekTo(newTime, true);
      },
      updateHighlightedSubtitleAndPage,
      getCurrentTime: () => {
        return playerRef.current?.getCurrentTime
          ? playerRef.current.getCurrentTime()
          : 0;
      },
    }));

    useEffect(() => {
      window.history.replaceState(
        "fake-route",
        document.title,
        window.location.href
      );

      addEventListener("popstate", closeView);

      // Cleanup when this component unmounts
      return () => {
        removeEventListener("popstate", closeView);
        if (timeoutId) {
          clearTimeout(timeoutId);
        }
        if (intervalId.current) {
          clearInterval(intervalId.current);
          intervalId.current = undefined;
        }
        // Add these lines to clean up the player events
        if (
          playerRef.current &&
          typeof playerRef.current.stopVideo === "function"
        ) {
          playerRef.current.stopVideo();
          playerRef.current.destroy();
        }
      };
    }, []);

    useEffect(() => {
      if (snapshots) {
        snapshotsRef.current = snapshots;
      }
      if (
        playerRef.current! &&
        playerRef.current.seekTo &&
        shouldSetVideo === false &&
        !isVideoPaused
      ) {
        const currentTime = playerRef.current.getCurrentTime();
        let newHighlightedIndex = -1;
        let newHighlightedWordIndex = -1;

        const sentencesData = snapshotsRef.current![0].sentencesData;
        for (let i = 0; i < sentencesData.length; i++) {
          const sentence = sentencesData[i];
          if (
            currentTime >= sentence.start! &&
            currentTime < sentence.start! + sentence.duration! - 0.1
          ) {
            newHighlightedIndex = i;

            // Find the highlighted word within the found sentence
            for (let j = 0; j < sentence.sentenceWords.length; j++) {
              const word = sentence.sentenceWords[j];
              if (
                currentTime >= word.start &&
                currentTime < word.start + word.duration
              ) {
                newHighlightedWordIndex = j;
                break; // Exit the loop once the highlighted word is found
              }
            }

            break; // Exit the loop once the highlighted sentence is found
          }
        }
        onHighlightedSubtitleIndexChange?.(newHighlightedIndex);
        onHighlightedWordIndexChange?.(newHighlightedWordIndex);

        if (newHighlightedIndex) {
          const newPage = calculatePage(
            newHighlightedIndex!,
            sentencesPerPageRef.current,
            snapshotsRef.current![0].sentenceFrom!
          );
          if (!isNaN(newPage)) {
            handlePageChange(
              newPage,
              sentencesPerPageRef.current,
              true,
              true,
              false
            );
            onHighlightedSubtitleIndexChange?.(newHighlightedIndex);
            onHighlightedWordIndexChange?.(newHighlightedWordIndex);
            setLoadingFromFetch(false);
          }
        }
      }
      if (
        playerRef.current! &&
        playerRef.current.seekTo &&
        shouldSetVideo === true
      ) {
        const sentenceStart =
          snapshots![0].sentencesData[firstIndexAfterReset!]?.start!;
        const sentenceWords =
          snapshots![0].sentencesData[firstIndexAfterReset!]?.sentenceWords;
        let newHighlightedWordIndex = 0;

        for (let i = 0; i < sentenceWords.length; i++) {
          if (
            sentenceStart <=
            sentenceWords[i].start + sentenceWords[i].duration
          ) {
            newHighlightedWordIndex = i;
            break; // Stop once the correct word is found
          }
        }

        playerRef.current.seekTo(sentenceStart);

        onHighlightedSubtitleIndexChange?.(firstIndexAfterReset);
        onHighlightedWordIndexChange?.(newHighlightedWordIndex);

        setShouldSetVideo(false);
      }
      setLoadingFromFetch(false);
    }, [snapshots, shouldSetVideo, firstIndexAfterReset]);

    useEffect(() => {
      const fetchCurrentUser = async () => {
        const user = await getUser(cookies.access_token);
        setCurrentUser(user);
      };
      fetchCurrentUser();
      async () => {
        socket.connect();
      };
      if (isInitRender) setIsInitRender(false);
      return () => {
        if (timeoutId) {
          clearTimeout(timeoutId);
        }
        if (intervalId.current) {
          clearInterval(intervalId.current);
          intervalId.current = undefined;
        }
        async () => {
          socket.disconnect();
        };
      };
    }, []);

    const scheduleHandleTimeUpdate = async () => {
      if (
        !playerRef.current?.getCurrentTime() &&
        playerRef.current?.getCurrentTime() !== 0
      ) {
        return;
      }
      const currentTime = playerRef.current.getCurrentTime();
      let currentSentenceIndex = getCurrentIndex(
        snapshotsRef.current!,
        currentTime
      );

      if (currentSentenceIndex === -1) {
        currentSentenceIndex = 0;
      }
      const nextSentence =
        snapshotsRef.current![0].sentencesData[currentSentenceIndex];
      if (!nextSentence) {
        return;
      }
      const timeUntilNextSentence =
        (nextSentence.start! + nextSentence.duration! - currentTime) * 1000;
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      if (isMounted.current) {
        timeoutId = window.setTimeout(async () => {
          await handleTimeUpdate();
          // We need to reschedule the handleTimeUpdate because we just moved to the next sentence
          await scheduleHandleTimeUpdate();
        }, 10);
      }
    };

    const hasSeekToBeenCalledRef = useRef(false);

    const handlePlayerStateChange = useCallback(
      (event: any) => {
        if (
          event.data === YT.PlayerState.PLAYING &&
          !hasSeekToBeenCalledRef.current
        ) {
          if (!hasSeekToBeenCalledRef.current && isInitRender) {
            playerRef.current.seekTo(0, true); // Force the player to start at 0
            /* playerRef.current?.seekTo(
              snapshotsRef.current![0].sentencesData[0].start!
            ); */
            setIsInitRender(false);
            hasSeekToBeenCalledRef.current = true;
          }
        }
        if (event.data === YT.PlayerState.PLAYING && hasVideoPaused) {
          props.onPlay && props.onPlay();
          setIsVideoPaused(false);
          if (timeoutId) {
            clearTimeout(timeoutId);
          }
          if (intervalId.current) {
            clearInterval(intervalId.current);
          }
          intervalId.current = setInterval(() => {
            if (
              playerRef.current?.getPlayerState() !== YT.PlayerState.PAUSED &&
              playerRef.current?.getPlayerState() !== YT.PlayerState.ENDED
            ) {
              //props.onPause && props.onPause();
              socket.emit("video-playing", {
                libraryId: libraryId,
                currentTime: playerRef.current?.getCurrentTime(),
              });
            }
          }, 10000);
          if (!isInitRender) scheduleHandleTimeUpdate();
          if (isInitRender) {
            setIsInitRender(false);
          }
        } else if (
          event.data === YT.PlayerState.PAUSED ||
          event.data === YT.PlayerState.ENDED
        ) {
          props.onPause && props.onPause();
          setIsVideoPaused(true);
          setHasVideoPaused(true);
          if (timeoutId) {
            clearTimeout(timeoutId);
            timeoutId = null;
          }
          if (intervalId.current) {
            clearInterval(intervalId.current);
            intervalId.current = undefined;
          }
        }

        if (event.data === YT.PlayerState.BUFFERING) {
          if (hasSeekHappenedRef.current === false) {
            if (
              currentUser?.userLibraries &&
              currentUser.userLibraries.some(
                (library) => library.libraryId === libraryId
              )
            ) {
              const userLibraryWatched = currentUser.userLibraries.find(
                (library) => library.libraryId === libraryId
              );
              if (userLibraryWatched) {
                playerRef.current?.seekTo(userLibraryWatched.timeStamp);
              }
            }
          }
          hasSeekHappenedRef.current = true;
          setIsInitRender(false);
          handleTimeUpdate();
        }
        return () => {
          if (timeoutId) {
            clearTimeout(timeoutId);
          }
        };
      },
      [
        handlePageChange,
        shouldSetVideo,
        snapshots,
        isInitRender,
        hasVideoPaused,
      ]
    );

    const [duration, setDuration] = useState(0);

    const updateHighlightedSubtitleAndPage = (currentTime) => {
      const newIndex = getCurrentIndex(snapshotsRef.current!, currentTime);

      if (
        currentTime > snapshotsRef.current![0].end ||
        currentTime < snapshotsRef.current![0].start
      ) {
        const snapshotInfo = findSnapshotWithCurrentTime(
          currentLibrary!,
          currentTime
        );
        const newPage = Math.ceil(
          snapshotInfo?.sentenceFrom! / sentencesPerPageRef.current
        );

        handlePageChange(
          newPage,
          sentencesPerPageRef.current,
          false,
          true,
          true,
          currentTime
        );
      }

      if (newIndex !== -1) {
        onHighlightedSubtitleIndexChange?.(newIndex);

        const newPage = calculatePage(
          newIndex,
          sentencesPerPageRef.current,
          snapshotsRef.current![0].sentenceFrom
        );

        const newHighlightedWordIndex = getCurrentWordIndex(
          snapshotsRef.current!,
          newIndex,
          currentTime
        );
        if (newHighlightedWordIndex !== -1) {
          onHighlightedWordIndexChange?.(newHighlightedWordIndex);
        }

        if (newPage !== currentPageToUseRef.current) {
          handlePageChange(
            newPage,
            sentencesPerPageRef.current,
            true,
            true,
            false
          );
          currentPageToUseRef.current = newPage; // Update the current page reference
        }
      }
    };

    const handlePlayerReady = (event) => {
      //playerRef.current.pauseVideo();
      setDuration(playerRef.current.getDuration());
    };

    const initializeYouTubePlayer = () => {
      if (playerDivRef.current && currentLibrary) {
        playerRef.current = new YT.Player(playerDivRef.current, {
          videoId: currentLibrary!.videoId,
          playerVars: {
            autoplay: 0,
            //controls: 0,
            rel: 0,
            showinfo: 0,
            start: 0,
          },
          events: {
            onStateChange: handlePlayerStateChange,
            onPlaybackRateChange: handlePlayerStateChange,
            onError: (event) => {
              console.error("YouTube Player Error", event);
            },
          },
        });
      }
    };

    useEffect(() => {
      const fetchLibraryItemAndSetupPlayer = async () => {
        if (isInitRender) {
          if (!libraryItem) {
            const library = await getLibraryItem(libraryId!);
            setCurrentLibrary(library);
          } else {
            setCurrentLibrary(libraryItem);
          }
          handlePageChange(1, sentencesPerPageRef.current, false, false, false);
        }
        window.onYouTubeIframeAPIReady = () => {
          if (playerDivRef.current && !playerRef.current && currentLibrary) {
            initializeYouTubePlayer();
            playerRef.current.addEventListener("onReady", function () {
              handlePlayerReady();
              if (playerRef.current.seekTo) {
                //playerRef.current.seekTo(0.1, true);
              }
            });
          }
        };

        if (window.YT && window.YT.loaded) {
          window.onYouTubeIframeAPIReady();
        } else {
          const tag = document.createElement("script");
          tag.src = "https://www.youtube.com/iframe_api";
          const firstScriptTag = document.getElementsByTagName("script")[0];
          firstScriptTag.parentNode!.insertBefore(tag, firstScriptTag);
        }
      };
      fetchLibraryItemAndSetupPlayer();
    }, [handlePageChange, handlePlayerStateChange]);

    useEffect(() => {
      sentencesPerPageRef.current = sentencesPerPage;
    }, [sentencesPerPage]);

    const handleTimeUpdate = async () => {
      if (
        !playerRef.current?.getCurrentTime() &&
        playerRef.current?.getCurrentTime() !== 0
      ) {
        return;
      }

      const currentTime = playerRef.current.getCurrentTime();
      const startIndex = getCurrentIndex(snapshotsRef.current!, currentTime);

      if (startIndex === -1) {
        return;
      }

      const pageNumber = calculatePage(
        startIndex,
        sentencesPerPage,
        snapshotsRef.current![0].sentenceFrom
      );

      const pageNumberToUse =
        playerRef.current?.getPlayerState() === YT.PlayerState.PAUSED
          ? currentPageToUseRef.current
          : pageNumber;

      currentPageToUseRef.current = pageNumberToUse;

      const newHighlightedIndex =
        currentTime < snapshotsRef.current![0].sentencesData[0].start!
          ? 0
          : snapshotsRef.current![0].sentencesData.findIndex((sentence) => {
              return (
                currentTime >= sentence.start! &&
                currentTime < sentence.start! + sentence.duration! - 0.1
              );
            });
      if (
        newHighlightedIndex === null ||
        newHighlightedIndex === undefined ||
        newHighlightedIndex === -1 ||
        isNaN(newHighlightedIndex)
      ) {
        return;
      }

      if (
        currentTime > snapshotsRef.current![0].end ||
        currentTime < snapshotsRef.current![0].start
      ) {
        const snapshotInfo = findSnapshotWithCurrentTime(
          currentLibrary!,
          currentTime
        );
        const newPage = Math.ceil(
          snapshotInfo?.sentenceFrom! / sentencesPerPageRef.current
        );

        if (!isNaN(newPage)) {
          handlePageChange(
            newPage,
            sentencesPerPageRef.current,
            false,
            true,
            true
          );
        }
      }

      if (newHighlightedIndex === -1) {
        const snapshotInfo = findSnapshotWithCurrentTime(
          currentLibrary!,
          currentTime
        );

        const newPage = Math.ceil(
          snapshotInfo?.sentenceFrom! / sentencesPerPageRef.current
        );
        if (!isNaN(newPage)) {
          startIndexRef.current =
            newPage * sentencesPerPageRef.current -
            snapshotsRef.current![0].sentenceFrom +
            1;
          endIndexRef.current = Math.ceil(
            newPage * sentencesPerPageRef.current -
              snapshotsRef.current![0].sentenceFrom
          );
        }
      } else {
        if (
          onHighlightedSubtitleIndexChange &&
          newHighlightedIndex !== null &&
          newHighlightedIndex !== undefined &&
          !isNaN(newHighlightedIndex)
        ) {
          if (
            startIndexRef.current === null ||
            endIndexRef.current === null ||
            newHighlightedIndex! < startIndexRef.current ||
            newHighlightedIndex! > endIndexRef.current
          ) {
            const newPage = calculatePage(
              newHighlightedIndex!,
              sentencesPerPageRef.current,
              snapshotsRef.current![0].sentenceFrom!
            );
            if (!isNaN(newPage)) {
              startIndexRef.current =
                (newPage - 1) * sentencesPerPageRef.current -
                snapshotsRef.current![0].sentenceFrom +
                1;
              endIndexRef.current = Math.ceil(
                newPage * sentencesPerPageRef.current -
                  snapshotsRef.current![0].sentenceFrom
              );

              handlePageChange(
                newPage,
                sentencesPerPageRef.current,
                true,
                true,
                false
              );
            }
          }

          const currentSentence =
            snapshotsRef.current![0].sentencesData[newHighlightedIndex];
          let newHighlightedWordIndex = -1; // Default to the first word unless a better match is found
          //const currentTime = playerRef.current?.getCurrentTime(); // Assuming you have access to the current time from the player

          for (let i = 0; i < currentSentence.sentenceWords.length; i++) {
            const word = currentSentence.sentenceWords[i];
            if (
              currentTime >= word.start &&
              currentTime < word.start + word.duration
            ) {
              newHighlightedWordIndex = i;
              break; // Stop once the correct word is found
            }
          }

          if (onHighlightedSubtitleIndexChange) {
            onHighlightedSubtitleIndexChange(newHighlightedIndex!);
          }
          onHighlightedWordIndexChange?.(newHighlightedWordIndex);
        }
      }
    };

    return (
      <>
        <div>
          {/* {duration}
          <Slider.Root
            className={`${styles.sliderRoot}`}
            max={2340}
            defaultValue={[0]} // Sync default value with current time
            onValueChange={handleSliderChange}
            orientation="horizontal"
            step={1}
            style={{ marginLeft: "-60px" }}
          >
            <Slider.Track className={`${styles.sliderTrack}`}>
              <Slider.Range className={`${styles.sliderRangek}`} />
            </Slider.Track>
            <Slider.Thumb
              className={`${styles.sliderThumb}`}
              aria-label="Volume"
            />
          </Slider.Root> */}
        </div>
        {/* <div style={{ paddingBottom: "56.25%", height: 0 }}> */}
        <div ref={playerDivRef} className={`${styles.yt}`} />
        {/* </div> */}
      </>
    );
  }
);

export default EmbeddedVideo;

export function getCurrentIndex(
  snapshots: Snapshot[],
  currentTime: number
): number {
  const currentIndex = snapshots[0].sentencesData.findIndex((sentence) => {
    return (
      currentTime >= sentence.start! &&
      currentTime <= sentence.start! + sentence.duration!
    );
  });
  return currentIndex;
}

export function findSnapshotWithCurrentTime(
  libraryItem: LibraryItem,
  currentTime: number
): SnapshotInfo | null {
  for (let snapshot of libraryItem.snapshotsInfo) {
    if (snapshot.start <= currentTime && currentTime <= snapshot.end) {
      return snapshot;
    }
  }
  return null;
}

const getCurrentWordIndex = (snapshots, sentenceIndex, currentTime) => {
  const sentence = snapshots[0].sentencesData[sentenceIndex];
  for (let i = 0; i < sentence.sentenceWords.length; i++) {
    const word = sentence.sentenceWords[i];
    if (currentTime >= word.start && currentTime < word.start + word.duration) {
      return i;
    }
  }
  return -1;
};
