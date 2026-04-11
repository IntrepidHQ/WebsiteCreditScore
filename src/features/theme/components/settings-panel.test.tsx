import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it } from "vitest";

import { SettingsPanel } from "@/features/theme/components/settings-panel";
import { useThemeStore } from "@/store/theme-store";

describe("SettingsPanel", () => {
  beforeEach(() => {
    useThemeStore.getState().restoreDefaults();
  });

  it("updates the live branding preview", async () => {
    const user = userEvent.setup();

    render(<SettingsPanel />);

    await user.click(screen.getByRole("tab", { name: /^Agency$/ }));
    const agencyNameInput = screen.getByLabelText(/agency name/i);
    await user.clear(agencyNameInput);
    await user.type(agencyNameInput, "Studio North");

    expect(screen.getByText("Studio North")).toBeInTheDocument();
  });
});
