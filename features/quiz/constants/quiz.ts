/**
 * Quiz constants — extracted from the Flutter implementation
 * (`quiz_home.dart` setup state + the hard-coded 66-book list) and the
 * repository RPC call. Nothing invented.
 *
 * BOOK NUMBERING: the Quiz uses the **1..66 canonical order** (Flutter's
 * hard-coded list, e.g. उत्पत्ति = 1 … प्रकाश = 66) — the SAME value passed
 * to the `get_random_quiz_questions` RPC as `p_book_number`. This is
 * DIFFERENT from the web Bible feature's book codes (0..460 / 470..730), so
 * the Quiz keeps its OWN list (faithful) and does NOT reuse the Bible
 * feature's `useBooks`/book-picker data.
 */
import type { QuizDifficulty } from "../types";

/** A quiz book option (Flutter `(int, String)` record). */
export interface QuizBook {
  bookNumber: number;
  name: string;
}

/** The 66-book list — a FAITHFUL port of the hard-coded `books` list in
 * `quiz_home.dart` (1..66, Nepali names). */
export const QUIZ_BIBLE_BOOKS: readonly QuizBook[] = [
  { bookNumber: 1, name: "उत्पत्ति" },
  { bookNumber: 2, name: "प्रस्थान" },
  { bookNumber: 3, name: "लेवी" },
  { bookNumber: 4, name: "गन्ती" },
  { bookNumber: 5, name: "व्यवस्था" },
  { bookNumber: 6, name: "यहोशू" },
  { bookNumber: 7, name: "न्यायकर्ताहरू" },
  { bookNumber: 8, name: "रूथ" },
  { bookNumber: 9, name: "१ शमूएल" },
  { bookNumber: 10, name: "२ शमूएल" },
  { bookNumber: 11, name: "१ राजाहरू" },
  { bookNumber: 12, name: "२ राजाहरू" },
  { bookNumber: 13, name: "१ इतिहास" },
  { bookNumber: 14, name: "२ इतिहास" },
  { bookNumber: 15, name: "एज्रा" },
  { bookNumber: 16, name: "नहेम्याह" },
  { bookNumber: 17, name: "एस्तर" },
  { bookNumber: 18, name: "अय्यूब" },
  { bookNumber: 19, name: "भजनसंग्रह" },
  { bookNumber: 20, name: "हितोपदेश" },
  { bookNumber: 21, name: "उपदेशक" },
  { bookNumber: 22, name: "श्रेष्ठगीत" },
  { bookNumber: 23, name: "यशैया" },
  { bookNumber: 24, name: "यर्मिया" },
  { bookNumber: 25, name: "विलाप" },
  { bookNumber: 26, name: "इजकिएल" },
  { bookNumber: 27, name: "दानिएल" },
  { bookNumber: 28, name: "होशे" },
  { bookNumber: 29, name: "योएल" },
  { bookNumber: 30, name: "आमोस" },
  { bookNumber: 31, name: "ओबदिया" },
  { bookNumber: 32, name: "योना" },
  { bookNumber: 33, name: "मीका" },
  { bookNumber: 34, name: "नहूम" },
  { bookNumber: 35, name: "हबक्कूक" },
  { bookNumber: 36, name: "सपन्याह" },
  { bookNumber: 37, name: "हाग्गै" },
  { bookNumber: 38, name: "जकरिया" },
  { bookNumber: 39, name: "मलाकी" },
  { bookNumber: 40, name: "मत्ती" },
  { bookNumber: 41, name: "मर्कूस" },
  { bookNumber: 42, name: "लूका" },
  { bookNumber: 43, name: "यूहन्ना" },
  { bookNumber: 44, name: "प्रेरितहरूका काम" },
  { bookNumber: 45, name: "रोमी" },
  { bookNumber: 46, name: "१ कोरिन्थी" },
  { bookNumber: 47, name: "२ कोरिन्थी" },
  { bookNumber: 48, name: "गलाती" },
  { bookNumber: 49, name: "एफिसी" },
  { bookNumber: 50, name: "फिलिप्पी" },
  { bookNumber: 51, name: "कलस्सी" },
  { bookNumber: 52, name: "१ थिस्सलोनिकी" },
  { bookNumber: 53, name: "२ थिस्सलोनिकी" },
  { bookNumber: 54, name: "१ तिमोथी" },
  { bookNumber: 55, name: "२ तिमोथी" },
  { bookNumber: 56, name: "तीतस" },
  { bookNumber: 57, name: "फिलेमोन" },
  { bookNumber: 58, name: "हिब्रू" },
  { bookNumber: 59, name: "याकूब" },
  { bookNumber: 60, name: "१ पत्रुस" },
  { bookNumber: 61, name: "२ पत्रुस" },
  { bookNumber: 62, name: "१ यूहन्ना" },
  { bookNumber: 63, name: "२ यूहन्ना" },
  { bookNumber: 64, name: "३ यूहन्ना" },
  { bookNumber: 65, name: "यहूदा" },
  { bookNumber: 66, name: "प्रकाश" },
];

/** The "All Books" option (Flutter `DropdownMenuItem(value: null, '📖 All Books')`). */
export const QUIZ_BOOK_ALL: QuizBook | null = null;

/** The difficulty options (Flutter `_difficulty` dropdown: Easy / Hard). */
export const QUIZ_DIFFICULTIES: {
  value: QuizDifficulty;
  label: string;
}[] = [
  { value: "easy", label: "Easy" },
  { value: "hard", label: "Hard" },
];

/** The language options — ONLY `np` (Flutter's `en` item is COMMENTED OUT). */
export const QUIZ_LANGUAGES: {
  value: string;
  label: string;
}[] = [{ value: "np", label: "नेपाली" }];

/** The number-of-questions options (Flutter `_limit` dropdown). */
export const QUIZ_LIMIT_OPTIONS = [10, 20, 30] as const;

/** The default difficulty (Flutter `_difficulty = 'hard'`). */
export const QUIZ_DEFAULT_DIFFICULTY: QuizDifficulty = "hard";

/** The default language (Flutter `_languageCode = 'np'`). */
export const QUIZ_DEFAULT_LANGUAGE = "np";

/** The default question count (Flutter `_limit = 20`). */
export const QUIZ_DEFAULT_LIMIT = 20;

/** The RPC default limit when `QuizParam.limit` is null (repository `?? 30`). */
export const QUIZ_RPC_DEFAULT_LIMIT = 30;

/** The Supabase RPC name (Flutter `SupabaseRepository.fetchQuestions`). */
export const QUIZ_RPC_NAME = "get_random_quiz_questions";
