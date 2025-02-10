import React, { PropsWithChildren } from "react";

const Authlayout = ({ children }: PropsWithChildren) => {
  return <div className="min-h-screen flex items-center justify-center">{children}</div>;
};

export default Authlayout;
