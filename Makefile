#
# Copyright (C) 2025 luci-theme-kuro
# Licensed under the Apache License, Version 2.0.
#

include $(TOPDIR)/rules.mk

LUCI_TITLE:=Kuro Theme (A modern dark-mode LuCI theme built with Vite 8 and Tailwind CSS)
LUCI_DEPENDS:=+luci-base

PKG_VERSION:=1.0.2
PKG_RELEASE:=20260604
PKG_LICENSE:=Apache-2.0

LUCI_MINIFY_CSS:=
CONFIG_LUCI_CSSTIDY:=

include $(TOPDIR)/feeds/luci/luci.mk

# call BuildPackage - OpenWrt buildroot signature
