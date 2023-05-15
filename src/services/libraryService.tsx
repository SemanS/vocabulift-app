import { LibraryItem } from "@/models/libraryItem.interface";
import { LabelType } from "@/models/sentences.interfaces";
import { UserEntity } from "@/models/user";

export const getLibraryItem = async (
  libraryId: string
): Promise<LibraryItem> => {
  const response = await fetch(
    `${import.meta.env.VITE_REACT_APP_SERVER_ENDPOINT}/library/${libraryId}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${sessionStorage.getItem("access_token")}`,
      },
    }
  );
  const data = await response.json();
  console.log(data);
  return data.library;
};

export const getLibraryItems = async (
  userEntity: UserEntity
): Promise<Record<LabelType, LibraryItem[]>> => {
  const response = await fetch(
    `${import.meta.env.VITE_REACT_APP_SERVER_ENDPOINT}/libraries`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${sessionStorage.getItem("access_token")}`,
      },
      body: JSON.stringify({ userEntity }),
    }
  );
  const data = await response.json();
  return data.libraryItems;
};

export const postLibraryInputVideoLanguages = async (input: string) => {
  const response = await fetch(
    `${
      import.meta.env.VITE_REACT_APP_SERVER_ENDPOINT
    }/library/input/video/languages`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${sessionStorage.getItem("access_token")}`,
      },
      body: JSON.stringify({ input }),
    }
  );

  return response;
};

export const postLibraryVideo = async (
  sourceLanguage: string,
  targetLanguage: string,
  input: string
) => {
  console.log("input" + input);
  const response = await fetch(
    `${import.meta.env.VITE_REACT_APP_SERVER_ENDPOINT}/library/add/video`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${sessionStorage.getItem("access_token")}`,
      },
      body: JSON.stringify({
        input: input,
        sourceLanguage: sourceLanguage,
        targetLanguage: targetLanguage,
      }),
    }
  );
  return response.json();
};

export async function pollProgressUpdates(
  eventId: string,
  onProgressUpdate: (progress: number) => void,
  onSliderUpdate: (updateSlider: true) => void
) {
  const intervalId = setInterval(async () => {
    const response = await fetch(
      `${import.meta.env.VITE_REACT_APP_SERVER_ENDPOINT}/progress/${eventId}`,
      {
        headers: {
          "Content-Type": "text/plain;charset=UTF-8",
          Authorization: `Bearer ${sessionStorage.getItem("access_token")}`,
        },
      }
    );

    const progressData = await response.json();

    if (progressData.progressStatus === "Complete") {
      onProgressUpdate(100);
      clearInterval(intervalId);
      localStorage.removeItem("ongoingEventId");
      localStorage.removeItem("progress");
      // Handle the finalized status, e.g., update the UI
    } else {
      onProgressUpdate(progressData.progressPercentage); // Update the progress using the callback
      localStorage.setItem("progress", progressData.progressPercentage);
      if (progressData.progressPercentage !== 0) {
        onSliderUpdate(true);
      }
    }
  });
}
