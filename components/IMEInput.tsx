"use client";

import { useState, useEffect, useRef, InputHTMLAttributes, TextareaHTMLAttributes } from "react";

interface IMEInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "onChange"> {
  value: string;
  onChange: (value: string) => void;
}

export function IMEInput({ value, onChange, ...props }: IMEInputProps) {
  const composingRef = useRef(false);
  const [localVal, setLocalVal] = useState(value);

  useEffect(() => {
    if (!composingRef.current) setLocalVal(value);
  }, [value]);

  return (
    <input
      value={localVal}
      onChange={(e) => {
        setLocalVal(e.target.value);
        if (!composingRef.current) onChange(e.target.value);
      }}
      onCompositionStart={() => {
        composingRef.current = true;
      }}
      onCompositionEnd={(e) => {
        composingRef.current = false;
        const val = (e.target as HTMLInputElement).value;
        setLocalVal(val);
        onChange(val);
      }}
      {...props}
    />
  );
}

interface IMETextareaProps extends Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, "onChange"> {
  value: string;
  onChange: (value: string) => void;
}

export function IMETextarea({ value, onChange, ...props }: IMETextareaProps) {
  const composingRef = useRef(false);
  const [localVal, setLocalVal] = useState(value);

  useEffect(() => {
    if (!composingRef.current) setLocalVal(value);
  }, [value]);

  return (
    <textarea
      value={localVal}
      onChange={(e) => {
        setLocalVal(e.target.value);
        if (!composingRef.current) onChange(e.target.value);
      }}
      onCompositionStart={() => {
        composingRef.current = true;
      }}
      onCompositionEnd={(e) => {
        composingRef.current = false;
        const val = (e.target as HTMLTextAreaElement).value;
        setLocalVal(val);
        onChange(val);
      }}
      {...props}
    />
  );
}
