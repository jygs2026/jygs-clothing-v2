"use client"

import * as React from "react"
import { Menu as MenuPrimitive } from "@base-ui/react/menu"

import { cn } from "@/lib/utils"

function Menu({ ...props }: MenuPrimitive.Root.Props) {
  return <MenuPrimitive.Root {...props} />
}

function MenuTrigger({ ...props }: MenuPrimitive.Trigger.Props) {
  return <MenuPrimitive.Trigger data-slot="menu-trigger" {...props} />
}

function MenuContent({
  className,
  children,
  side = "bottom",
  sideOffset = 10,
  align = "end",
  alignOffset = 0,
  ...props
}: MenuPrimitive.Popup.Props &
  Pick<
    MenuPrimitive.Positioner.Props,
    "side" | "sideOffset" | "align" | "alignOffset"
  >) {
  return (
    <MenuPrimitive.Portal>
      <MenuPrimitive.Positioner
        side={side}
        sideOffset={sideOffset}
        align={align}
        alignOffset={alignOffset}
        className="z-50 outline-hidden"
      >
        <MenuPrimitive.Popup
          data-slot="menu-content"
          className={cn(
            "min-w-[13rem] origin-(--transform-origin) rounded-[4px] border border-border bg-popover py-1.5 text-popover-foreground shadow-[0_18px_40px_-24px] shadow-foreground/35 outline-hidden transition-[transform,opacity] duration-150 ease-out data-ending-style:scale-[0.98] data-ending-style:opacity-0 data-starting-style:scale-[0.98] data-starting-style:opacity-0",
            className
          )}
          {...props}
        >
          {children}
        </MenuPrimitive.Popup>
      </MenuPrimitive.Positioner>
    </MenuPrimitive.Portal>
  )
}

/** Shared by Item and LinkItem so an action and a link read identically. */
const menuItemClass =
  "flex w-full cursor-pointer items-center gap-2.5 px-3.5 py-2.5 text-[13.5px] leading-none text-foreground/85 no-underline outline-hidden select-none transition-colors data-disabled:pointer-events-none data-disabled:opacity-50 data-highlighted:bg-accent/10 data-highlighted:text-accent-2 [&_svg]:size-4 [&_svg]:shrink-0 [&_svg]:text-foreground/50 data-highlighted:[&_svg]:text-accent-2"

function MenuItem({ className, ...props }: MenuPrimitive.Item.Props) {
  return (
    <MenuPrimitive.Item
      data-slot="menu-item"
      className={cn(menuItemClass, className)}
      {...props}
    />
  )
}

function MenuLinkItem({
  className,
  closeOnClick = true,
  ...props
}: MenuPrimitive.LinkItem.Props) {
  return (
    <MenuPrimitive.LinkItem
      data-slot="menu-link-item"
      closeOnClick={closeOnClick}
      className={cn(menuItemClass, className)}
      {...props}
    />
  )
}

function MenuSeparator({ className, ...props }: MenuPrimitive.Separator.Props) {
  return (
    <MenuPrimitive.Separator
      data-slot="menu-separator"
      className={cn("my-1.5 h-px bg-border", className)}
      {...props}
    />
  )
}

function MenuGroup({ ...props }: MenuPrimitive.Group.Props) {
  return <MenuPrimitive.Group data-slot="menu-group" {...props} />
}

function MenuGroupLabel({
  className,
  ...props
}: MenuPrimitive.GroupLabel.Props) {
  return (
    <MenuPrimitive.GroupLabel
      data-slot="menu-group-label"
      className={cn(
        "px-3.5 py-1.5 text-[10.5px] tracking-[0.12em] text-foreground/45 uppercase",
        className
      )}
      {...props}
    />
  )
}

export {
  Menu,
  MenuTrigger,
  MenuContent,
  MenuItem,
  MenuLinkItem,
  MenuSeparator,
  MenuGroup,
  MenuGroupLabel,
}
