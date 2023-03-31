import { UserLibraryItem } from "@/models/userLibraryItem.interface";

export const getUserLibraryItems = async (
  accessToken: string | null,
  onSuccess: (data: UserLibraryItem[]) => void
): Promise<void> => {
  const response = await fetch(
    `${import.meta.env.VITE_REACT_APP_SERVER_ENDPOINT}/user/library`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );
  const data = await response.json();
  onSuccess(data.results);
};

export const getSentences = async (
  id: string | undefined,
  sentenceFrom: number,
  countOfSentences: number,
  localSentenceFrom: number
) => {
  const response = await fetch(
    `${
      import.meta.env.VITE_REACT_APP_SERVER_ENDPOINT
    }/sentence/${id}?sentenceFrom=${
      localSentenceFrom ? localSentenceFrom : sentenceFrom
    }&countOfSentences=${countOfSentences}`,
    {
      headers: {
        "Content-Type": "text/plain;charset=UTF-8",
        Authorization: `Bearer ${sessionStorage.getItem("access_token")}`,
      },
    }
  );

  const data = await response.json();
  return data;
};

export const getUserSentences = async (
  libraryId: string | undefined,
  sentenceFrom: number,
  countOfSentences: number,
  localSentenceFrom: number,
  sourceLanguage: string,
  targetLanguage: string
) => {
  const requestBody = {
    libraryId: libraryId,
    sentenceFrom: localSentenceFrom ? localSentenceFrom : sentenceFrom,
    countOfSentences: countOfSentences,
    localSentenceFrom: localSentenceFrom,
    sourceLanguage: sourceLanguage,
    targetLanguage: targetLanguage,
  };

  const response = await fetch(
    `${import.meta.env.VITE_REACT_APP_SERVER_ENDPOINT}/user/sentences`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${sessionStorage.getItem("access_token")}`,
      },
      body: JSON.stringify(requestBody),
    }
  );
  const data = await response.json();
  return data.results;
};

export const addUserPhrase = async (
  word: string,
  libraryId: string | undefined,
  sentence_no: number | null,
  startPosition: number | null,
  endPosition: number | null,
  sourceLanguage: string,
  targetLanguage: string,
  accessToken: string | null
): Promise<any> => {
  const requestBody = {
    word: word,
    libraryId: libraryId,
    sentence_no: sentence_no,
    startPosition: startPosition,
    endPosition: endPosition,
    sourceLanguage: sourceLanguage,
    targetLanguage: targetLanguage,
  };
  const response = await fetch(
    `${import.meta.env.VITE_REACT_APP_SERVER_ENDPOINT}/user/add-phrase`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(requestBody),
    }
  );

  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`);
  }

  return response.json();
};

export const deleteUserPhrase = async (
  libraryId: string | undefined,
  sentence_no: number | null,
  startPosition: number | null,
  sourceLanguage: string,
  targetLanguage: string,
  accessToken: string | null
): Promise<void> => {
  const requestBody = {
    libraryId: libraryId,
    sentence_no: sentence_no,
    startPosition: startPosition,
    sourceLanguage: sourceLanguage,
    targetLanguage: targetLanguage,
  };
  await fetch(
    `${import.meta.env.VITE_REACT_APP_SERVER_ENDPOINT}/user/delete-phrase`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(requestBody),
    }
  );
};