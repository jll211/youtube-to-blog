import React from "react";

const Tabs = React.forwardRef(({ value, onValueChange, className = '', ...props }, ref) => {
  const [activeTab, setActiveTab] = React.useState(value);

  React.useEffect(() => {
    setActiveTab(value);
  }, [value]);

  const handleValueChange = (newValue) => {
    setActiveTab(newValue);
    onValueChange?.(newValue);
  };

  return (
    <div
      ref={ref}
      data-state={activeTab}
      className={`tabs ${className}`}
      {...props}
    />
  );
});
Tabs.displayName = "Tabs";

const TabsList = React.forwardRef(({ className = '', ...props }, ref) => (
  <div
    ref={ref}
    className={`inline-flex h-9 items-center justify-center rounded-lg bg-muted p-1 text-muted-foreground ${className}`}
    {...props}
  />
));
TabsList.displayName = "TabsList";

const TabsTrigger = React.forwardRef(({ value, className = '', ...props }, ref) => {
  const context = React.useContext(TabsContext);
  const active = context?.value === value;

  return (
    <button
      ref={ref}
      role="tab"
      aria-selected={active}
      data-state={active ? "active" : "inactive"}
      className={`inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow ${className}`}
      onClick={() => context?.onValueChange?.(value)}
      {...props}
    />
  );
});
TabsTrigger.displayName = "TabsTrigger";

const TabsContent = React.forwardRef(({ value, className = '', ...props }, ref) => {
  const context = React.useContext(TabsContext);
  const active = context?.value === value;

  if (!active) return null;

  return (
    <div
      ref={ref}
      role="tabpanel"
      data-state={active ? "active" : "inactive"}
      className={`mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${className}`}
      {...props}
    />
  );
});
TabsContent.displayName = "TabsContent";

const TabsContext = React.createContext(null);

export { Tabs, TabsList, TabsTrigger, TabsContent };
