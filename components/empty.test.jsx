import { render, screen } from "@testing-library/react";
import Empty from "./empty";
import "jest-styled-components";

jest.mock("next/router", () => ({
  useRouter: () => ({
    push: () => null,
  }),
}));

describe("Empty", () => {
  const empty = {
    description: "Test description",
    label: "Action",
    actionRoute: "/",
  };

  it("render props", () => {
    render(<Empty empty={empty} />);

    const description = screen.getByText(empty.description);
    const label = screen.getByText(empty.label);

    expect(description).toBeInTheDocument();
    expect(label).toBeInTheDocument();
  });

  it("renders empty component unchanged", () => {
    const { container } = render(<Empty empty={empty} />);
    expect(container).toMatchSnapshot();
  });
});
