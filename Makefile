BASEINSTALLDIR := $(DESTDIR)/home/pi/zynthian-webconf

.PHONY: install-zynthian-webconf
install-zynthian-webconf:
	echo "  > Installing zynthian-webconf"
	mkdir -p $(BASEINSTALLDIR)/
	find ./ \
		-maxdepth 1 \
		-not -name . \
		-not -name 'debian' \
		-not -name '*.deb' \
		-exec cp -pr $(shell realpath {}) $(BASEINSTALLDIR)/ \;

.PHONY: install
install: install-zynthian-webconf

.PHONY: build
build:
	echo "  > Building zynthian-webconf"

.DEFAULT_GOAL := build
