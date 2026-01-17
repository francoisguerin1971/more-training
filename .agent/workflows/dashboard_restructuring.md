# Implementation Plan - Athlete Dashboard Professional Restructuring

This plan outlines the restructuring of the Athlete Dashboard to provide a high-performance, professional experience focused on macro-cycle progression, weekly compliance, and structured session logging.

## 1. Core Objectives
- **Macro-Cycle Priority**: Display the macro-cycle position and main goal at the top.
- **Bi-Level Stats**: Separate "Pure Stats" from "Actionable Feedback".
- **Fused Session View**: Combine the today's workout details with the logging/feedback form.
- **Conditional Ecosystem**: Place device-connected data at the second plan (bottom).
- **Educational Context**: Add tooltips with explanations and actionable advice for every major section.

## 2. Structural Changes (`AthleteDashboard.tsx`)

### Phase 1: Header & Macro-Cycle
- Move the Macro-Cycle chart to the top-most position.
- Enrich the Macro-Cycle chart to include:
    - **Forecast Area**: The planned load progression.
    - **Actual Load Line**: Solid line for completed workouts.
    - **RPE Curve**: A distinct secondary line (e.g., in indigo/purple) representing perceived effort.
- Add an information point (Tooltip) explaining these three layers.

### Phase 2: Weekly Performance & Goals
- Place "Weekly Compliance" and "Main Goal" side-by-side or in a high-visibility row.
- Add the "Time Distribution" (Zones) chart here as a performance diagnostic tool.

### Phase 3: The "Action" Block (Fusion)
- Merge `todaysSession` details and `Feedback/Logging` into a single, cohesive Card/Section.
- **Left/Top**: Technical details (Warm-up, Main, Cool-down, Sketches).
- **Right/Bottom**: Direct logging (RPE, Duration, Sensations).
- Color-code the logging section as "Expected Action" (e.g., using emerald gradients).

### Phase 4: Anticipation & Ecosystem
- List "Upcoming Sessions" with a refined UI.
- Move "Recovery Status" and "Wearable Integration" to the bottom of the page or a secondary section.

## 3. Component Enhancements
- **Global Helper**: Update the `CardHeader` or `InfoTooltip` to support "Action Needed" indicators.
- **Chart Legends**: Add clear legends for Forecast vs. Actual vs. RPE.

## 4. Internationalization
- Use the newly added translation keys:
    - `info_macro_cycle`, `action_macro_cycle`
    - `info_weekly_compliance`, `action_weekly_compliance`
    - `rpe_curve`, `planned_curve`, `actual_curve`, `forecast`, `loading_cycle`

## 5. Verification
- Verify layout responsiveness (Desktop vs Mobile).
- Test the "No-Device" scenario to ensure the dashboard remains premium without wearables.
