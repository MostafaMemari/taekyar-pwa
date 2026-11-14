// Entry animation lives on the page blocks, never on <main>: a transform on an ancestor anchors
// position:fixed children (the directory FAB) to the page bottom for the animation's duration,
// so the dock pops in late instead of being there from the first frame.
export const PAGE_ENTER = "motion-safe:animate-in motion-safe:fade-in-0 motion-safe:slide-in-from-bottom-1 motion-safe:duration-300";
