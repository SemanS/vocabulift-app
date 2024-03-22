import React, {
  FC,
  useEffect,
  useCallback,
  useMemo,
  useReducer,
  useRef,
} from "react";
import {
  Card,
  Row,
  Col,
  Space,
  Checkbox,
  RadioChangeEvent,
  Radio,
  Modal,
  Typography,
  Select,
  Spin,
  Button,
} from "antd";
import { PageContainer } from "@ant-design/pro-layout";
import { useLocation, useParams, useNavigate } from "react-router-dom";
import { useRecoilState } from "recoil";
import TranslateBox from "./components/TranslateBox/TranslateBox";
import PaginationControls from "./components/PaginationControls/PaginationControls";
import { LabelType } from "@/models/sentences.interfaces";
import { calculateFirstIndex, getRangeNumber } from "@/utils/stringUtils";
import {
  deleteUserPhrases,
  getUserSentences,
  updateReadingProgress,
} from "@/services/userService";
import { UserSentence } from "@/models/userSentence.interface";
import { VocabularyListUserPhrase } from "@/models/VocabularyListUserPhrase";
import { mapUserSentencesToVocabularyListUserPhrases } from "@/utils/mapUserSentencesToVocabularyListUserPhrases";
import FilteredVocabularyList from "./components/VocabularyList/FilteredVocabularyList";
import { sourceLanguageState, targetLanguageState } from "@/stores/language";
import { libraryIdState } from "@/stores/library";
import { currentPageState } from "@/stores/library";
import { pageSizeState } from "@/stores/library";
import styles from "./index.module.less";
import { Snapshot } from "@/models/snapshot.interfaces";
import { getSnapshots } from "@/services/snapshotService";
import { userState } from "@/stores/user";
import EmbeddedVideo from "./components/EmbeddedVideo/EmbeddedVideo";
import PricingComponent from "@/pages/webLayout/shared/components/Pricing/PricingComponent";
import Masonry from "react-masonry-css";
import { getWorkSheet } from "@/services/aiService";
import html2pdf from "html2pdf.js";
import { getLibraryItem } from "@/services/libraryService";
import { getFlagCode } from "@/utils/utilMethods";
import { SvgIcon } from "@/pages/webLayout/shared/common/SvgIcon";
import { useIntl } from "react-intl";

const initialReducerState = (targetLanguageFromQuery: string) => ({
  currentPage: 1,
  currentTextIndex: 0,
  sentenceFrom: 1,
  firstIndexAfterReset: null,
  loadingFromFetch: false,
  loading: true,
  shouldSetVideo: false,
  wordData: null,
  showWordDefinition: false,
  mode: "all",
  snapshots: null,
  userSentences: null,
  libraryTitle: "",
  label: "",
  videoId: "",
  totalSentences: 0,
  vocabularyListUserPhrases: null,
  selectedUserPhrase: null,
  showVocabularyList: true,
  selectAll: true,
  colSpan: 24,
  settingsDrawerVisible: false,
  countOfSentences: 100,
  sentencesPerPage: 10,
  initState: true,
  isLimitExceeded: false,
  selectedLanguageTo: targetLanguageFromQuery,
  wordMeaningData: null,
  loadingFromWordMeaning: false,
  isMobile: false,
  isPlaying: false,
  subscribed: false,
});

function reducer(state: any, action: any) {
  switch (action.type) {
    case "setCurrentPage":
      return { ...state, currentPage: action.payload };
    case "setCurrentTextIndex":
      return { ...state, currentTextIndex: action.payload };
    case "setSentenceFrom":
      return { ...state, sentenceFrom: action.payload };
    case "setFirstIndexAfterReset":
      return { ...state, firstIndexAfterReset: action.payload };
    case "setLoadingFromFetch":
      return { ...state, loading: action.payload };
    case "setLoading":
      return { ...state, loadingFromFetch: action.payload };
    case "setLoadingWorkSheet":
      return { ...state, loadingWorkSheet: action.payload };
    case "setLoadingFromWordMeaning":
      return { ...state, loadingFromWordMeaning: action.payload };
    case "setShouldSetVideo":
      return { ...state, shouldSetVideo: action.payload };
    case "setWordData":
      return { ...state, wordData: action.payload };
    case "setShowWordDefinition":
      return { ...state, showWordDefinition: action.payload };
    case "setMode":
      return { ...state, mode: action.payload };
    case "setSnapshots":
      return { ...state, snapshots: action.payload };
    case "setUserSentences":
      return { ...state, userSentences: action.payload };
    case "setLibraryTitle":
      return { ...state, libraryTitle: action.payload };
    case "setLabel":
      return { ...state, label: action.payload };
    case "setVideoId":
      return { ...state, videoId: action.payload };
    case "setTotalSentences":
      return { ...state, totalSentences: action.payload };
    case "setVocabularyListUserPhrases":
      return { ...state, vocabularyListUserPhrases: action.payload };
    case "setSelectedUserPhrase":
      return { ...state, selectedUserPhrase: action.payload };
    case "setShowVocabularyList":
      return { ...state, showVocabularyList: action.payload };
    case "setSelectAll":
      return { ...state, selectAll: action.payload };
    case "setColSpan":
      return { ...state, colSpan: action.payload };
    case "toggleSettingsDrawer":
      return { ...state, settingsDrawerVisible: !state.settingsDrawerVisible };
    case "setCountOfSentences":
      return { ...state, countOfSentences: action.payload };
    case "setSentencesPerPage":
      return { ...state, sentencesPerPage: action.payload };
    case "setHighlightedSubtitleIndex":
      return { ...state, highlightedSubtitleIndex: action.payload };
    case "setInitState":
      return { ...state, initState: action.payload };
    case "setIsLimitExceeded":
      return { ...state, isLimitExceeded: action.payload };
    case "setSelectedLanguageTo":
      return { ...state, selectedLanguageTo: action.payload };
    case "setWordMeaningData":
      return { ...state, wordMeaningData: action.payload };
    case "setIsMobile":
      return { ...state, isMobile: action.payload };
    case "setIsPlaying":
      return { ...state, isPlaying: action.payload };
    case "setLibrary":
      return { ...state, library: action.payload };
    default:
      throw new Error();
  }
}

const BookDetail: FC = () => {
  const navigate = useNavigate();
  const { libraryId } = useParams();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const pageSizeFromQuery = parseInt(queryParams.get("pageSize") as string);
  const currentPageFromQuery = parseInt(
    queryParams.get("currentPage") as string
  );
  const targetLanguageFromQuery = queryParams.get("targetLanguage") as string;
  const [sourceLanguage, setSourceLanguage] =
    useRecoilState(sourceLanguageState);
  const [targetLanguage, setTargetLanguage] =
    useRecoilState(targetLanguageState);
  const [recoilCurrentPage, setRecoilCurrentPage] =
    useRecoilState(currentPageState);
  const [recoilPageSize, setRecoilPageSize] = useRecoilState(pageSizeState);
  const [recoilLibraryId, setRecoilLibraryId] = useRecoilState(libraryIdState);
  const [user, setUser] = useRecoilState(userState);
  const videoPlayerRef = useRef<ExposedFunctions | null>(null);

  const [state, dispatch] = useReducer(
    reducer,
    initialReducerState(targetLanguageFromQuery)
  );

  const setSelectedUserPhrase = (
    selectedUserPhrase: VocabularyListUserPhrase
  ) => dispatch({ type: "setSelectedUserPhrase", payload: selectedUserPhrase });
  const setCurrentPage = (page: any) =>
    dispatch({ type: "setCurrentPage", payload: page });
  const setCurrentTextIndex = (index: any) =>
    dispatch({ type: "setCurrentTextIndex", payload: index });
  const setSentenceFrom = (sentence: any) =>
    dispatch({ type: "setSentenceFrom", payload: sentence });
  const setFirstIndexAfterReset = (index: number) =>
    dispatch({ type: "setFirstIndexAfterReset", payload: index });
  const setLoadingWorkSheet = (isLoadingWorkSheet: boolean) =>
    dispatch({ type: "setLoadingWorkSheet", payload: isLoadingWorkSheet });
  const setLoading = (isLoading: boolean) =>
    dispatch({ type: "setLoading", payload: isLoading });
  const setLoadingFromFetch = (isLoading: boolean) =>
    dispatch({ type: "setLoadingFromFetch", payload: isLoading });
  const setLoadingFromWordMeaning = (isLoading: boolean) =>
    dispatch({ type: "setLoadingFromWordMeaning", payload: isLoading });
  const setShouldSetVideo = (shouldSetVideo: boolean) =>
    dispatch({ type: "setShouldSetVideo", payload: shouldSetVideo });
  const setMode = (mode: string) =>
    dispatch({ type: "setMode", payload: mode });
  const setIsMobile = (isMobile: boolean) =>
    dispatch({ type: "isMobile", payload: isMobile });
  const setIsPlaying = (isPlaying: boolean) =>
    dispatch({ type: "isPlaying", payload: isPlaying });
  const setHighlightedSubtitleIndex = (
    highlightedSubtitleIndex: number | null
  ) =>
    dispatch({
      type: "setHighlightedSubtitleIndex",
      payload: highlightedSubtitleIndex,
    });
  const setSelectedLanguageTo = (language: string) =>
    dispatch({ type: "setSelectedLanguageTo", payload: language });
  const setLibrary = (library: any) =>
    dispatch({ type: "setLibrary", payload: library });

  const intl = useIntl();

  const users = [
    { email: "Katharina.Landes@senacor.com" },
    { email: "james@englishlab.online" },
    { email: "adriana@taliancinaonline.sk" }, //iTalki
    { email: "krishnagoswami.52@gmail.com" },
    { email: "limudim972@gmail.com" },
    { email: "ninakocurova0@gmail.com" },
    { email: "slavosmn@gmail.com" },
    { email: "lubec.seman@gmail.com" },
    { email: "Paulina@polskidaily.eu" },
    { email: "info@angolrahangolva.com" },
    { email: "info@brona.cz" },
    { email: "ytcontact+emma@engvid.com" },
    { email: "tiffani@speakenglishwithtiffani.com" },
    { email: "support@francaisauthentique.com" },
    { email: "business@englishwithlucy.co.uk" },
    { email: "contact@speakenglishwithvanessa.com" },
    { email: "business@3s-media.net" },
    { email: "hello@englishwithgreg.com" },
    { email: "info@englishlessonviaskype.com" },
  ];

  const hasAccess = users.some(
    (existingUser) => existingUser.email === user.email
  );

  const handlePageChange = useCallback(
    async (
      page: number,
      pageSize: number,
      changeTriggeredByHighlightChange: boolean = false,
      changeTriggeredFromVideo: boolean = false,
      changeTriggeredFromVideoFetch: boolean = false
    ) => {
      const newQueryParams = new URLSearchParams(location.search);
      newQueryParams.set("currentPage", page.toString());
      newQueryParams.set("pageSize", pageSize.toString());
      let localSentenceFrom;

      if (changeTriggeredFromVideo) {
        if (changeTriggeredFromVideoFetch) {
          localSentenceFrom = (page - 1) * pageSize + 1;
          await fetchAndUpdate(localSentenceFrom);
          dispatch({ type: "setSentenceFrom", payload: localSentenceFrom });
          dispatch({
            type: "setFirstIndexAfterReset",
            payload: calculateFirstIndex(page, pageSize),
          });
          dispatch({ type: "setLoadingFromFetch", payload: true });
        }
      } else {
        await updateReadingProgress(libraryId, page, pageSize);
        if (state.initState) {
          localSentenceFrom = changeTriggeredFromVideo
            ? (page - 1) * state.pageSizeFromQuery + 1
            : (state.currentPageFromQuery - 1) * state.pageSizeFromQuery + 1;
          await fetchAndUpdate(localSentenceFrom);
          dispatch({ type: "setInitState", payload: false });
        } else if (
          state.sentenceFrom + state.countOfSentences < page * pageSize ||
          page * pageSize > state.sentenceFrom + state.countOfSentences ||
          page * pageSize < state.sentenceFrom
        ) {
          localSentenceFrom = (page - 1) * pageSize + 1;
          await fetchAndUpdate(localSentenceFrom);
          dispatch({
            type: "setFirstIndexAfterReset",
            payload: calculateFirstIndex(page, pageSize),
          });
        }
        if (state.snapshots && !changeTriggeredByHighlightChange) {
          dispatch({
            type: "setFirstIndexAfterReset",
            payload: calculateFirstIndex(page, pageSize),
          });
          if (!changeTriggeredByHighlightChange) {
            dispatch({ type: "setShouldSetVideo", payload: true });
          }
        }
      }

      dispatch({
        type: "setCurrentTextIndex",
        payload: (page - 1) * (pageSize || state.sentencesPerPage),
      });
      dispatch({ type: "setCurrentPage", payload: page });
      dispatch({
        type: "setSentenceFrom",
        payload: getRangeNumber((page - 1) * pageSize + 1),
      });
      navigate({
        pathname: location.pathname,
        search: newQueryParams.toString(),
      });
    },
    [
      state,
      state.initState,
      state.currentPageFromQuery,
      state.pageSizeFromQuery,
      state.sentenceFrom,
      state.countOfSentences,
      state.sentencesPerPage,
      state.changeTriggeredByHighlightChange,
    ]
  );

  const handlePlay = () => {
    dispatch({ type: "setIsPlaying", payload: true });
  };

  const handlePause = () => {
    dispatch({ type: "setIsPlaying", payload: false });
  };

  const handlePlayPause = () => {
    if (state.isPlaying) {
      videoPlayerRef.current.pauseVideo();
    } else {
      videoPlayerRef.current.playVideo();
    }
    dispatch({ type: "setIsPlaying", payload: !state.isPlaying });
  };

  useEffect(() => {
    if (
      user.isLimitExceeded === true &&
      user.subscribed === false &&
      !hasAccess
    ) {
      dispatch({ type: "setIsLimitExceeded", payload: true });
    } else {
      if (pageSizeFromQuery) {
        dispatch({ type: "setSentencesPerPage", payload: pageSizeFromQuery });
      }
      if (currentPageFromQuery) {
        dispatch({ type: "setCurrentPage", payload: currentPageFromQuery });
      }
      handlePageChange(
        currentPageFromQuery,
        pageSizeFromQuery,
        false,
        false,
        false
      );
      setRecoilLibraryId(libraryId!);
      setRecoilCurrentPage(currentPageFromQuery);
      setRecoilPageSize(pageSizeFromQuery);
    }

    const handleResize = () => {
      dispatch({ type: "setIsMobile", payload: window.innerWidth <= 750 });
    };

    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const handleAddWordDefinition = useCallback(async (word: string) => {
    // Fetch word details from public API
    fetch(
      `https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(
        word
      )}`
    )
      .then((response) => response.json())
      .then((data) => {
        if (data && data[0]) {
          dispatch({ type: "setWordData", payload: data[0] });
          dispatch({ type: "setShowWordDefinition", payload: true });
        } else {
          dispatch({ type: "setWordData", payload: null });
        }
      })
      .catch((error) => {
        console.error(error);
      });
  }, []);

  const handleModeChange = useCallback((e: RadioChangeEvent) => {
    dispatch({ type: "setMode", payload: e.target.value });
  }, []);

  const memoizedSnapshots = useMemo(() => state.snapshots, [state.snapshots]);

  const fetchDataAndUpdateState = useCallback(
    async (localSentenceFrom: number, targetLanguage?: string) => {
      dispatch({ type: "setLoadingFromFetch", payload: true });
      const snapshots = await getSnapshots(
        libraryId!,
        user.sourceLanguage,
        targetLanguage ? [targetLanguage] : [user.targetLanguage],
        undefined,
        localSentenceFrom
      );

      await updateSentencesState(snapshots, localSentenceFrom);

      dispatch({ type: "setLoadingFromFetch", payload: false });
    },
    [
      getSnapshots,
      libraryId,
      sourceLanguage,
      targetLanguage,
      state.selectedLanguageTo,
    ]
  );

  const updateSentencesState = useCallback(
    async (snapshots: Snapshot[], localSentenceFrom: number) => {
      let language = state.selectedLanguageTo;
      const isLanguageInSnapshots = snapshots.some(
        (snapshot) => snapshot.language === state.selectedLanguageTo
      );

      if (!isLanguageInSnapshots && snapshots.length > 0) {
        language = snapshots[1].language;
        dispatch({
          type: "setSelectedLanguageTo",
          payload: language,
        });
      }

      const userSentencesData: UserSentence[] = await getUserSentences({
        sentenceFrom: state.sentenceFrom,
        countOfSentences: state.countOfSentences,
        sourceLanguage: user.sourceLanguage,
        targetLanguage: language,
        orderBy: "sentenceNo",
        libraryId,
        localSentenceFrom,
      });

      const vocabularyListUserPhrases =
        mapUserSentencesToVocabularyListUserPhrases(userSentencesData);

      dispatch({ type: "setSnapshots", payload: snapshots });
      dispatch({ type: "setLibraryTitle", payload: snapshots[0].title });
      dispatch({ type: "setLabel", payload: snapshots[0].label });
      dispatch({ type: "setVideoId", payload: snapshots[0].videoId });
      dispatch({
        type: "setTotalSentences",
        payload: snapshots[0].totalSentences,
      });
      dispatch({
        type: "setVocabularyListUserPhrases",
        payload: vocabularyListUserPhrases,
      });
      dispatch({ type: "setUserSentences", payload: userSentencesData });
    },
    [state.selectedLanguageTo, setSelectedLanguageTo]
  );

  const handleAddUserPhrase = useCallback(
    async (vocabularyListUserPhrase: VocabularyListUserPhrase) => {
      try {
        dispatch({
          type: "setSelectedUserPhrase",
          payload: vocabularyListUserPhrase,
        });
        handleAddWordDefinition(vocabularyListUserPhrase.phrase.sourceText);
        const updateVocabularyListUserPhrases = [
          ...(state.vocabularyListUserPhrases || []),
          vocabularyListUserPhrase,
        ];

        const userSentence: UserSentence = {
          libraryId: libraryId!,
          sentenceNo: vocabularyListUserPhrase.sentenceNo,
          sourceLanguage: sourceLanguage,
          targetLanguage: state.selectedLanguageTo,
          phrases: [vocabularyListUserPhrase.phrase],
          _id: "",
          userId: "",
          countOfPhrases: 0,
          sentenceText: "",
          title: "",
          sentencesPerPage: 0,
          currentPage: 0,
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        const updateUserSentences = [
          ...(state.userSentences || []),
          userSentence,
        ];

        dispatch({
          type: "setVocabularyListUserPhrases",
          payload: updateVocabularyListUserPhrases,
        });
        dispatch({ type: "setUserSentences", payload: updateUserSentences });
      } catch (error) {
        console.error("Error adding user phrase:", error);
      }
    },
    [state.userSentences, state.vocabularyListUserPhrases]
  );

  function getBase64Image(imgUrl, callback) {
    var img = new Image();

    // onload event handler
    img.onload = function () {
      var canvas = document.createElement("canvas");
      canvas.width = this.width;
      canvas.height = this.height;

      var ctx = canvas.getContext("2d");
      ctx.drawImage(this, 0, 0);

      var dataURL = canvas.toDataURL("image/png");
      callback(dataURL);
    };

    // set source
    img.src = imgUrl;
  }

  const handleDownloadWorkSheet = async () => {
    dispatch({ type: "setLoadingWorkSheet", payload: true });

    let htmlContent = await getWorkSheet(
      sourceLanguage,
      targetLanguage,
      libraryId!
    );

    const element = document.createElement("div");
    element.style.margin = "20px";
    // Create a temporary container to parse your htmlContent
    const tempContainer = document.createElement("div");
    tempContainer.innerHTML = htmlContent;

    // Find and remove all iframes
    Array.from(tempContainer.getElementsByTagName("iframe")).forEach(
      (iframe) => {
        iframe.parentElement!.removeChild(iframe);
      }
    );

    // Now use this cleaned HTML as your content
    htmlContent = tempContainer.innerHTML;
    element.innerHTML = htmlContent;

    // Here, let's say each block of content that should stay together per page is encapsulated by a div
    const blocks = Array.from(element.getElementsByTagName("div"));
    blocks.forEach(
      (block) =>
        (block.style.cssText +=
          "; page-break-inside: avoid;margin-bottom: 13.333pt;")
    );

    let base64Logo: any;

    getBase64Image(
      `${import.meta.env.VITE_BASE_URL}/vocabulift_logo.png`,
      function (base64Image) {
        base64Logo = base64Image;
      }
    );

    html2pdf()
      .from(element)
      .set({
        margin: [50, 15, 15, 15],
        jsPDF: { unit: "pt", format: "letter", orientation: "portrait" },
        pagebreak: { after: "section", mode: ["avoid-all", "css", "legacy"] },
      })
      .toPdf()
      .get("pdf")
      .then((pdf) => {
        const totalPages = pdf.internal.getNumberOfPages();
        const currentDate = new Date();

        for (let i = 1; i <= totalPages; i++) {
          pdf.setPage(i);
          pdf.setFontSize(8);
          pdf.setTextColor(150);

          // Adding header line
          let margin = 15;
          let lineHeight = 50;
          let pageWidth = pdf.internal.pageSize.getWidth() - margin;
          pdf.line(margin, lineHeight, pageWidth, lineHeight);

          // Adding the vocabulift.com text at the end of the line
          pdf.text("https://vocabulift.com", pageWidth - 75, lineHeight - 5);
          let imageX = 15;
          let imageY = 15;
          pdf.addImage(base64Logo, "PNG", 15, 10, 50, 50);
        }
      })
      .save(state.libraryTitle + "-worksheet.pdf");

    dispatch({ type: "setLoadingWorkSheet", payload: false });
  };

  const handleDeleteUserPhrase = useCallback(
    async (
      phraseId: string,
      sentenceId: string,
      startPosition: number,
      sentenceNo: number
    ) => {
      // Update sentences in TranslateBox by deleted sentences
      const updatedUserSentences = state.userSentences.map((sentence) => {
        if (sentence.sentenceNo === sentenceNo) {
          return {
            ...sentence,
            phrases: sentence.phrases.filter(
              (phrase) => phrase.startPosition !== startPosition
            ),
          };
        }
        return sentence;
      });

      // Update sentences in VocabularyList by deleted sentences
      const updatedVocabularyListUserPhrases =
        state.vocabularyListUserPhrases!.filter(
          (item) =>
            !(
              item.phrase.startPosition === startPosition &&
              item.sentenceNo === sentenceNo
            )
        );
      try {
        await deleteUserPhrases([phraseId]).then(() => {
          dispatch({
            type: "setVocabularyListUserPhrases",
            payload: updatedVocabularyListUserPhrases,
          });
          dispatch({ type: "setUserSentences", payload: updatedUserSentences });
        });

        // Filter out the element with the specified startPosition and sentenceNo
      } catch (error) {
        console.error("Error deleting user phrase:", error);
      }
    },
    [state.userSentences, state.vocabularyListUserPhrases]
  );

  const onShowSizeChange = useCallback(
    async (current: number, pageSize: number) => {
      // Calculate the new current page based on the new page size
      const newCurrentPage =
        Math.floor(((current - 1) * state.sentencesPerPage) / pageSize) + 1;
      dispatch({ type: "setSentencesPerPage", payload: pageSize });
      await handlePageChange(newCurrentPage, pageSize);
    },
    [state.sentencesPerPage]
  );

  const fetchVocabularyAndSetState = useCallback(
    async (localSentenceFrom: number, value: string) => {
      const userSentencesData: UserSentence[] = await getUserSentences({
        sentenceFrom: state.sentenceFrom,
        countOfSentences: state.countOfSentences,
        sourceLanguage: user.sourceLanguage,
        targetLanguage: value,
        orderBy: "sentenceNo",
        libraryId,
        localSentenceFrom,
      });

      const vocabularyListUserPhrases =
        mapUserSentencesToVocabularyListUserPhrases(userSentencesData);

      dispatch({
        type: "setVocabularyListUserPhrases",
        payload: vocabularyListUserPhrases,
      });
    },
    [state.selectedLanguageTo]
  );

  const fetchAndUpdate = useCallback(
    async (localSentenceFrom: number, targetLanguage?: string) => {
      dispatch({ type: "setLoadingFromFetch", payload: true });
      const library = await getLibraryItem(libraryId!);
      dispatch({ type: "setLibrary", payload: library });
      await fetchDataAndUpdateState(
        getRangeNumber(localSentenceFrom),
        targetLanguage
      );
      dispatch({ type: "setLoadingFromFetch", payload: false });
    },
    [fetchDataAndUpdateState]
  );

  const onCheckboxChange = useCallback(
    (e: any) => {
      if (e.target.name === "vocabularyList") {
        dispatch({ type: "setShowVocabularyList", payload: e.target.checked });
      } else if (e.target.name === "wordDefinition") {
        dispatch({ type: "setShowWordDefinition", payload: e.target.checked });
      }
      if (
        e.target.checked &&
        state.showVocabularyList &&
        state.showWordDefinition
      ) {
        dispatch({ type: "setSelectAll", payload: true });
      } else {
        dispatch({ type: "setSelectAll", payload: false });
      }
    },
    [state.showVocabularyList, state.showWordDefinition]
  );

  const onSelectAllChange = useCallback((e: any) => {
    const isChecked = e.target.checked;
    dispatch({ type: "setShowVocabularyList", payload: isChecked });
    dispatch({ type: "setShowWordDefinition", payload: isChecked });
    dispatch({ type: "setSelectAll", payload: isChecked });
  }, []);

  useEffect(() => {
    let newColSpan = 24;

    if (state.showVocabularyList && state.showWordDefinition) {
      newColSpan = 12;
    } else if (state.showVocabularyList || state.showWordDefinition) {
      newColSpan = 24;
    }

    dispatch({ type: "setColSpan", payload: newColSpan });
  }, [state.showVocabularyList, state.showWordDefinition]);

  const renderSettingsDrawerContent = () => {
    return (
      <>
        <Row
          justify="space-between"
          align="middle"
          style={{ marginBottom: "16px" }}
        >
          <Col>
            <Row gutter={[16, 16]}>
              <Col>
                <Space>
                  <Checkbox
                    name="vocabularyList"
                    checked={state.showVocabularyList}
                    onChange={onCheckboxChange}
                  >
                    Vocabulary List
                  </Checkbox>
                  <Checkbox
                    name="wordDefinition"
                    checked={state.showWordDefinition}
                    onChange={onCheckboxChange}
                  >
                    Word Definition
                  </Checkbox>
                </Space>
              </Col>
              <Col>
                <Space>
                  <Checkbox
                    name="selectAll"
                    checked={state.selectAll}
                    onChange={onSelectAllChange}
                  >
                    Select All
                  </Checkbox>
                </Space>
              </Col>
            </Row>
          </Col>
        </Row>
      </>
    );
  };

  const breakpointColumnsObj = {
    default: 2,
    1100: 2,
    750: 2,
    749: 1,
  };

  const videoContainer = (
    <div className={`${styles.myVideoContainer}`}>
      {state.label === LabelType.VIDEO && (
        <EmbeddedVideo
          ref={videoPlayerRef}
          onHighlightedSubtitleIndexChange={setHighlightedSubtitleIndex}
          sentencesPerPage={state.sentencesPerPage}
          handlePageChange={handlePageChange}
          snapshots={memoizedSnapshots}
          shouldSetVideo={state.shouldSetVideo}
          setShouldSetVideo={setShouldSetVideo}
          firstIndexAfterReset={state.firstIndexAfterReset!}
          setLoadingFromFetch={setLoadingFromFetch}
          onPlay={handlePlay}
          onPause={handlePause}
        />
      )}
    </div>
  );

  const magnifyingGlassRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const magnifyingGlass = document.createElement("div");
    magnifyingGlass.className = "magnifying-glass";
    document.body.appendChild(magnifyingGlass);
    magnifyingGlassRef.current = magnifyingGlass;
    return () => {
      document.body.removeChild(magnifyingGlass);
    };
  }, []);

  const uniqueLanguages = Array.from(
    new Set(state.library?.snapshotsInfo?.map((snapshot) => snapshot.language))
  );
  //const uniqueLanguages = state.library?.snapshotsInfo;

  const languagesWithoutSource = uniqueLanguages.filter(
    (lang) => lang !== user.sourceLanguage
  );

  const translateBoxContainer = (
    <div>
      <Card bodyStyle={{ paddingTop: "20px", paddingBottom: "20px" }}>
        <>
          <Typography.Title level={5}>{state.libraryTitle}</Typography.Title>
          <Radio.Group
            onChange={handleModeChange}
            value={state.mode}
            buttonStyle="solid"
            style={{ paddingRight: 20, marginTop: 10 }}
          >
            {/* <Radio.Button value="phrases">Phrases</Radio.Button> */}
            <Radio.Button value="sentences" style={{ fontWeight: 500 }}>
              {intl.formatMessage({ id: "translate.box.sentences" })}
            </Radio.Button>
            <Radio.Button value="words" style={{ fontWeight: 500 }}>
              {intl.formatMessage({ id: "translate.box.words" })}
            </Radio.Button>
            <Radio.Button value="all" style={{ fontWeight: 500 }}>
              {intl.formatMessage({ id: "translate.box.all" })}
            </Radio.Button>
          </Radio.Group>
          {/* {user.subscriptionType !== SubscriptionType.Free ||
            (hasAccess && ( */}
          {/* <Button
            type="default"
            onClick={handleDownloadWorkSheet}
            loading={state.loadingWorkSheet}
            style={{ marginTop: 10, fontWeight: 500 }}
          >
            {intl.formatMessage({ id: "translate.box.download.worksheet" })}
          </Button> */}
          <Button
            type="default"
            onClick={() =>
              handleModeChange({ target: { value: "quiz" } } as any)
            }
            //loading={state.loadingWorkSheet}
            style={{ marginTop: 10, fontWeight: 500 }}
          >
            {intl.formatMessage({ id: "translate.box.quiz" })}
          </Button>
          <Select
            value={state.selectedLanguageTo}
            onChange={(value) => {
              dispatch({
                type: "setSelectedLanguageTo",
                payload: value,
              });
              fetchVocabularyAndSetState(state.sentenceFrom, value);
              fetchAndUpdate(state.sentenceFrom, value);
              const url = new URL(window.location.href);
              const params = new URLSearchParams(url.search);
              params.set("targetLanguage", value);
              window.history.replaceState({}, "", `${url.pathname}?${params}`);
            }}
            style={{ marginLeft: 16 }}
          >
            {languagesWithoutSource.map((language, index) => (
              <Select.Option key={index} value={language}>
                <SvgIcon code={getFlagCode(language)} height="16" />
              </Select.Option>
            ))}
          </Select>
          {/* ))} */}
        </>
      </Card>
      <Card
        loading={state.loading || state.loadingFromFetch}
        className={styles.translateBoxScroll}
      >
        <TranslateBox
          sourceLanguage={user.sourceLanguage}
          currentTextIndex={state.currentTextIndex}
          sentenceFrom={state.sentenceFrom}
          sentencesPerPage={state.sentencesPerPage}
          currentPage={state.currentPage}
          libraryTitle={state.libraryTitle}
          mode={state.mode}
          snapshots={memoizedSnapshots}
          userSentences={state.userSentences}
          onAddUserPhrase={handleAddUserPhrase}
          vocabularyListUserPhrases={state.vocabularyListUserPhrases}
          highlightedSentenceIndex={
            state.highlightedSubtitleIndex !== null
              ? state.highlightedSubtitleIndex - (state.currentTextIndex % 100)
              : null
          }
          selectedLanguageTo={state.selectedLanguageTo}
          onChangeMode={setMode}
          magnifyingGlassRef={magnifyingGlassRef}
        />
      </Card>
    </div>
  );

  const phraseListContainer = (
    <div className={styles.myVocabularyContainer} style={{ marginTop: "16px" }}>
      {state.showVocabularyList &&
        state.vocabularyListUserPhrases?.length !== 0 &&
        state.vocabularyListUserPhrases && (
          <>
            <FilteredVocabularyList
              title="Words"
              mode={"words"}
              phrases={state.vocabularyListUserPhrases!}
              onDeleteItem={handleDeleteUserPhrase}
              onWordClick={handleAddWordDefinition}
              selectedUserPhrase={state.selectedUserPhrase}
              setSelectedUserPhrase={setSelectedUserPhrase}
              selectedLanguageTo={state.selectedLanguageTo}
              style={{ marginBottom: "16px" }}
            />
            {/* <FilteredVocabularyList
              title="Phrases"
              mode={"phrases"}
              phrases={state.vocabularyListUserPhrases!}
              onDeleteItem={handleDeleteUserPhrase}
              onWordClick={handleAddWordDefinition}
              onQuestionClick={handleQuestionClick}
              onAlternativesClick={handleAlternativesClick}
              selectedLanguageTo={state.selectedLanguageTo}
              style={{ marginBottom: "16px" }}
            /> */}
          </>
        )}
    </div>
  );
  const paginationControlsContainer = (
    <Card
      bodyStyle={{
        paddingTop: "15px",
        paddingBottom: "15px",
      }}
      style={{ marginBottom: 16 }}
    >
      <PaginationControls
        currentPage={state.currentPage}
        onShowSizeChange={onShowSizeChange}
        handlePageChange={handlePageChange}
        totalSentences={state.totalSentences}
        sentencesPerPage={state.sentencesPerPage}
      />
    </Card>
  );

  const isMobile = window.innerWidth <= 600;

  return (
    <PageContainer title={false} className={styles.container}>
      {state.isLimitExceeded && user.subscribed === false && !hasAccess ? (
        <Modal open={true} closable={true} footer={false} width="80%" centered>
          <center>
            <Typography.Title style={{ marginTop: "30px" }}>
              You have exceeded your daily limit of either 5 minutes of viewing
              or 5 phrase meanings/alternatives. To continue, please subscribe,
              or wait for 3 hours to reset your limit:
            </Typography.Title>
          </center>
          <PricingComponent />
        </Modal>
      ) : (
        <>
          {!isMobile ? (
            <Masonry
              breakpointCols={breakpointColumnsObj}
              className={styles.myMasonryGrid}
              columnClassName={styles.myMasonryGridColumn}
            >
              {videoContainer}
              {translateBoxContainer}
              {phraseListContainer}
              <div className={`${styles.myVideoContainer}`}>
                {state.mode !== "quiz" && paginationControlsContainer}
                {(state.loadingFromWordMeaning || state.wordMeaningData) &&
                  {
                    /* <Card
                    title={"Word meaning"}
                    loading={state.loadingFromWordMeaning}
                  >
                    {state.wordMeaningData && state.wordMeaningData.data}
                  </Card> */
                  }}
              </div>
            </Masonry>
          ) : (
            <Masonry
              breakpointCols={breakpointColumnsObj}
              className={styles.myMasonryGrid}
              columnClassName={styles.myMasonryGridColumn}
            >
              {videoContainer}
              {translateBoxContainer}
              <div className={`${styles.myVideoContainer}`}>
                {paginationControlsContainer}
                {(state.loadingFromWordMeaning || state.wordMeaningData) &&
                  {
                    /* <Card
                    title={"Word meaning"}
                    loading={state.loadingFromWordMeaning}
                  >
                    {state.wordMeaningData && state.wordMeaningData.data}
                  </Card> */
                  }}
              </div>
              <button
                className={`${styles.myFixedPlayButton}`}
                onClick={handlePlayPause}
              >
                {state.isPlaying ? "❚❚" : "▶"}
              </button>
              {phraseListContainer}
            </Masonry>
          )}
        </>
      )}
    </PageContainer>
  );
};

export default BookDetail;
