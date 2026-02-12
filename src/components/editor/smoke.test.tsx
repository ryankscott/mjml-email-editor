// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import InspectorPanel from "@/features/editor/inspector/InspectorPanel";
import PreviewFrameContainer from "@/features/editor/preview/PreviewFrameContainer";
import BrandSettingsPanelContainer from "@/features/brand/components/BrandSettingsPanelContainer";

vi.mock("@tanstack/react-router", () => ({
  useNavigate: () => vi.fn(),
}));

vi.mock("@/components/editor/EditorProvider", () => ({
  useEditorState: () => ({
    blocks: [],
    selectedId: null,
  }),
  useEditorActions: () => ({
    updateBlock: vi.fn(),
    removeBlock: vi.fn(),
  }),
}));

vi.mock("@/components/editor/BrandProvider", () => ({
  useBrand: () => ({
    activeBrand: null,
    brands: [],
    activeBrandId: null,
    setActiveBrandId: vi.fn().mockResolvedValue(undefined),
    upsertBrand: vi.fn().mockResolvedValue(undefined),
    deleteBrand: vi.fn().mockResolvedValue(undefined),
    createDefaultBrand: vi.fn().mockResolvedValue({ id: "new" }),
  }),
}));

vi.mock("@/lib/mjml", () => ({
  compileBlocks: () => ({ html: "<p>preview</p>", errors: [] }),
}));

describe("component smoke", () => {
  it("renders preview frame container", () => {
    render(
      <PreviewFrameContainer
        mode="preview"
        device="desktop"
        variableValues={{}}
      />,
    );

    expect(screen.getByTitle("Email preview")).toBeTruthy();
  });

  it("renders inspector empty state", () => {
    render(<InspectorPanel />);

    expect(screen.getByText("Inspector")).toBeTruthy();
  });

  it("renders brand settings empty state", () => {
    render(<BrandSettingsPanelContainer />);

    expect(screen.getByText("No brands yet.")).toBeTruthy();
  });
});
