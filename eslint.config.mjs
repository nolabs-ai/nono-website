import nextCoreWebVitals from "eslint-config-next/core-web-vitals";
import nextTypescript from "eslint-config-next/typescript";

const eslintConfig = [
  ...nextCoreWebVitals,
  ...nextTypescript,
  {
    rules: {
      // eslint-config-next 16 newly enables this rule as an error. The sites it
      // flags (useTheme, ThemeToggle, TextScramble) are intentional mount-time
      // hydration / animation-init effects, not bugs. Keep it visible as a
      // warning rather than blocking; a proper useSyncExternalStore refactor
      // can be done separately.
      "react-hooks/set-state-in-effect": "warn",
    },
  },
  {
    ignores: [
      "node_modules/**",
      ".next/**",
      "out/**",
      "build/**",
      "next-env.d.ts",
    ],
  },
];

export default eslintConfig;
