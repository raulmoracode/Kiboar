export default {
  extends: ["@commitlint/config-conventional"],
  rules: {
    // The repository types in LABELS.md; the conventional defaults would
    // reject hotfix, bugfix, release, spike and experiment.
    "type-enum": [
      2,
      "always",
      [
        "feat",
        "fix",
        "hotfix",
        "bugfix",
        "refactor",
        "chore",
        "docs",
        "test",
        "style",
        "perf",
        "build",
        "ci",
        "revert",
        "release",
        "spike",
        "experiment",
      ],
    ],
  },
};
