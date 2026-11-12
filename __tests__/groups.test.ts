import { GROUPS, groupLabel } from "@/app/_lib/groups";

it("lists groups in block order with short labels", () => {
  expect(GROUPS).toEqual([
    { value: "permanent", label: "Permanent Teaching" },
    { value: "cos_non_teaching", label: "COS Non-Teaching" },
    { value: "permanent_non_teaching", label: "Permanent Non-Teaching" },
    { value: "cos_teaching", label: "COS Teaching" },
  ]);
});

it("labels null as Not set", () => {
  expect(groupLabel(null)).toBe("Not set");
  expect(groupLabel("cos_teaching")).toBe("COS Teaching");
});
