"use client";

import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useEffect, useState } from "react";
import { X } from "lucide-react";
import type { BuilderFormData } from "@/lib/types";
import { FRAME_ASSETS } from "@/lib/types";

const formSchema = z.object({
  name: z.string().min(2, "Name is required").max(30, "Name is too long"),
  roles: z.array(z.string().min(2).max(24)).min(1, "Add at least one role"),
  title: z.union([
    z.literal(""),
    z.enum([
      "Big hunter",
      "Frontend Captain",
      "Backend blacksmith",
      "Neural navigator",
      "Stack surfer",
      "Full stack flamingo",
      "Night owl builder",
      "Coffee compiler",
      "Data Dreamer",
      "Agent Tamer",
    ]),
  ]),
  frame: z.enum(["SIGNAL", "ON-CHAIN", "COASTAL CIRCUIT"]),
});

type FormValues = BuilderFormData;

export default function BuilderForm({
  formData,
  onChange,
}: {
  formData: FormValues;
  onChange: (data: FormValues) => void;
}) {
  const {
    register,
    control,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: formData,
  });
  const [roleInput, setRoleInput] = useState("");
  const [roleError, setRoleError] = useState("");

  const values = useWatch({ control }) as FormValues;

  useEffect(() => {
    // Only fire onChange if valid, or just pass it up and let generator handle it
    onChange(values);
  }, [values, onChange]);

  function addRole() {
    const role = roleInput.trim().replace(/\s+/g, " ");
    if (role.length < 2) return setRoleError("Type a role first");
    if (role.length > 24) return setRoleError("Keep roles under 24 characters");
    if (values.roles.some((item) => item.toLowerCase() === role.toLowerCase())) return setRoleError("Role already added");
    if (values.roles.length >= 8) return setRoleError("Add up to 8 roles");
    setRoleError("");
    const nextRoles = [...values.roles, role];
    setValue("roles", nextRoles, { shouldValidate: true, shouldDirty: true });
    setRoleInput("");
  }

  function removeRole(index: number) {
    const nextRoles = values.roles.filter((_, roleIndex) => roleIndex !== index);
    setValue("roles", nextRoles, { shouldValidate: true, shouldDirty: true });
  }

  return (
    <form className="flex flex-col gap-4">
      <div>
        <label className="mb-1 block text-xs font-bold uppercase text-brand-black">
          Name <span className="text-brand-pink">*</span>
        </label>
        <input
          {...register("name")}
          type="text"
          placeholder="Asha"
          className="w-full rounded-none border-2 border-brand-black bg-brand-white px-3 py-3 text-sm text-brand-black placeholder:text-black/40 focus:border-brand-pink focus:outline-none"
          maxLength={30}
        />
        {errors.name && (
          <span className="text-brand-pink text-xs">{errors.name.message}</span>
        )}
      </div>

      <div>
        <label className="mb-1 block text-xs font-bold uppercase text-brand-black">
          Stack / Role <span className="text-brand-pink">*</span>
        </label>
        <div className="flex flex-wrap gap-2">
          {values.roles.map((role, index) => {
            const fills = ["bg-brand-primary", "bg-brand-accent", "bg-brand-pink"];
            const textColors = ["text-brand-offwhite", "text-brand-black", "text-brand-white"];
            const fill = fills[index % fills.length];
            const textColor = textColors[index % textColors.length];
            return (
              <span key={`${role}-${index}`} className={`inline-flex items-center gap-2 border-2 border-brand-black ${fill} px-2 py-1 font-mono text-xs font-bold uppercase ${textColor}`}>
                {role}
                <button type="button" onClick={() => removeRole(index)} aria-label={`Remove ${role}`} className="hover:opacity-70">
                  <X size={13} strokeWidth={3} />
                </button>
              </span>
            );
          })}
        </div>
        <div className="mt-2 flex gap-2">
          <input
            value={roleInput}
            onChange={(event) => { setRoleInput(event.target.value); setRoleError(""); }}
            onKeyDown={(event) => { if (event.key === "Enter") { event.preventDefault(); addRole(); } }}
            type="text"
            placeholder="React, design, founder..."
            className="min-w-0 flex-1 rounded-none border-2 border-brand-black bg-brand-white px-3 py-3 text-sm text-brand-black placeholder:text-black/40 focus:border-brand-pink focus:outline-none"
            maxLength={24}
          />
          <button type="button" onClick={addRole} className="border-2 border-brand-black bg-brand-accent px-3 font-mono text-xs font-bold uppercase text-brand-black shadow-[3px_3px_0_#000] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none">
            Add
          </button>
        </div>
        {(roleError || errors.roles) && (
          <span className="text-brand-pink text-xs">{roleError || errors.roles?.message}</span>
        )}
      </div>

      <div>
        <label className="mb-1 block text-xs font-bold uppercase text-brand-black">
          Builder Title <span className="text-brand-pink">*</span>
        </label>
        <select
          {...register("title")}
          className="w-full cursor-pointer appearance-none rounded-none border-2 border-brand-black bg-brand-white px-3 py-3 text-sm text-brand-black focus:border-brand-pink focus:outline-none"
        >
          <option value="">Choose your builder title</option>
          <option value="Big hunter">Big hunter</option>
          <option value="Frontend Captain">Frontend Captain</option>
          <option value="Backend blacksmith">Backend blacksmith</option>
          <option value="Neural navigator">Neural navigator</option>
          <option value="Stack surfer">Stack surfer</option>
          <option value="Full stack flamingo">Full stack flamingo</option>
          <option value="Night owl builder">Night owl builder</option>
          <option value="Coffee compiler">Coffee compiler</option>
          <option value="Data Dreamer">Data Dreamer</option>
          <option value="Agent Tamer">Agent Tamer</option>
        </select>
      </div>

      <div>
        <label className="mb-1 block text-xs font-bold uppercase text-brand-black">
          Photo Frame <span className="text-brand-pink">*</span>
        </label>
        <div className="flex gap-2">
          {["SIGNAL", "ON-CHAIN", "COASTAL CIRCUIT"].map((f) => {
            const isSelected = values.frame === f;
            return (
              <button
                key={f}
                type="button"
                onClick={() => setValue("frame", f as FormValues["frame"], { shouldValidate: true, shouldDirty: true })}
                className={`flex flex-col items-center gap-1 flex-1 border-2 border-brand-black p-2 font-mono text-xs font-bold uppercase ${
                  isSelected ? "bg-brand-accent text-brand-black shadow-[2px_2px_0_#000]" : "bg-brand-white text-brand-black/60 hover:bg-brand-offwhite hover:text-brand-black"
                }`}
              >
                <span
                  aria-hidden="true"
                  className="h-14 w-14 border border-brand-black bg-brand-primary bg-contain bg-center bg-no-repeat"
                  style={{ backgroundImage: `url("/frames/${encodeURIComponent(FRAME_ASSETS[f as keyof typeof FRAME_ASSETS])}")` }}
                />
                {f}
              </button>
            );
          })}
        </div>
        <p className="mt-1 font-mono text-[10px] uppercase text-brand-black/60">Pick the frame energy for your card.</p>
      </div>
    </form>
  );
}
