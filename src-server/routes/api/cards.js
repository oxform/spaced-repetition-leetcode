const Router = require("express-promise-router");
const _ = require("lodash");
const Cards = require("../../components/cards");
const auth = require("../../components/auth/helpers");
let fetch;

(async () => {
  fetch = (await import("node-fetch")).default;
})();

module.exports = (app) => {
  const router = Router();
  const cards = Cards(app);
  const cardFields = [
    "last_reviewed",
    "due_date",
    "efactor",
    "interval",
    "review_outcome",
    "leetcodeFrontendId",
    "leetcodeName",
    "leetcodeDifficulty",
    "leetcodeUrl",
    "repetition",
    "attempts"
  ]

  // Create
  router.post("/", auth.authenticateFirebase, async (req, res) => {
    const data = await cards.create(
      req.user,
      _.pick(
        req.body,
        cardFields
      )
    );
    res.json(data);
  });

  router.get("/leetcode-problems", auth.authenticateFirebase, async (req, res) => {
    try {
      const { searchKeywords } = req.query;
      console.log("search keywords", searchKeywords);

      const query = {
        query: `
          query problemsetQuestionList($categorySlug: String, $limit: Int, $skip: Int, $filters: QuestionListFilterInput) {
            problemsetQuestionList: questionList(
              categorySlug: $categorySlug
              limit: $limit
              skip: $skip
              filters: $filters
            ) {
              total: totalNum
              questions: data {
                title
                frontendQuestionId: questionFrontendId
                difficulty
              }
            }
          }
        `,
        variables: {
          categorySlug: "", // Set these variables as needed
          limit: 10,
          skip: 0,
          filters: {
            searchKeywords: searchKeywords || "", // Use the captured searchKeywords or an empty string if not provided,
          },
        },
      };

      const response = await fetch("https://leetcode.com/graphql/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(query),
      });

      if (!response.ok) {
        throw new Error("Failed to fetch LeetCode problems");
      }

      let data = await response.json();

      // Apply filter logic
      const filteredQuestions =
        data.data.problemsetQuestionList.questions.filter((question) => {
          // Normalize search keywords and question title for case-insensitive comparison
          const normalizedSearchKeywords = searchKeywords.trim().toLowerCase();
          const normalizedTitle = question.title.toLowerCase();
          const frontendQuestionId = question.frontendQuestionId.toString();

          // Check for exact match with the question title or numeric identifier
          if (
            normalizedSearchKeywords === normalizedTitle ||
            normalizedSearchKeywords === frontendQuestionId
          ) {
            return true;
          }

          // Check for queries that potentially start with a numeric identifier followed by a title
          // Adjusted regex to optionally match a period and space after the numeric identifier
          const regex = /^(\d+)[.\s]*\s*(.*)$/; // Matches "number[. ] title"
          const searchMatch = normalizedSearchKeywords.match(regex);

          if (searchMatch) {
            const [_, searchId, searchTitle] = searchMatch;
            // Check if numeric identifier matches and if the rest of the search query matches the title
            if (
              searchId === frontendQuestionId &&
              (!searchTitle || normalizedTitle.includes(searchTitle))
            ) {
              return true;
            }
          } else {
            // For non-numeric initial queries, check if the query is part of the title
            if (normalizedTitle.includes(normalizedSearchKeywords)) {
              return true;
            }
          }

          // If none of the above conditions are met, the question does not match the search query
          return false;
        });

      console.log("filteredQuestions", filteredQuestions);

      res.json(filteredQuestions);
    } catch (error) {
      console.error("Error fetching LeetCode problems:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  });

  // Get all
  router.get("/", auth.authenticateFirebase, async (req, res) => {
    const data = await cards.get(req.user);

    // sort by due date ascending
    data.sort((a, b) => new Date(a.due_date) - new Date(b.due_date));

    res.json(data);
  });

  // Get one
  router.get("/:id(\\d+)", auth.authenticateFirebase, async (req, res) => {
    const data = await cards.getOne(req.params.id);
    res.json(data);
  });

  // Get due cards
  router.get("/due", auth.authenticateFirebase, async (req, res) => {
    const data = await cards.getDueCards(req.user);

    // Sort by due date
    data.sort((a, b) => new Date(a.due_date) - new Date(b.due_date));

    res.json(data);
  });

  // Update
  router.put("/:id(\\d+)", auth.authenticateFirebase, async (req, res) => {
    const data = await cards.update(
      req.params.id,
      _.pick(
        req.body,
        cardFields
      )
    );
    res.json(data);
  });

  // Delete
  router.delete("/:id(\\d+)", auth.authenticateFirebase, async (req, res) => {
    const data = await cards.delete(req.params.id);
    res.json(data);
  });

  return Router().use("/cards", router);
};
