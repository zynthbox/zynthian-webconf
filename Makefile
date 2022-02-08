BASEINSTALLDIR := $(DESTDIR)/home/pi/zynthian-webconf

install-zynthian-webconf:
	echo "  > Installing zynthian-webconf"
	mkdir -p $(BASEINSTALLDIR)/
	find ./ \
		-maxdepth 1 \
		-not -name . \
		-not -name 'debian' \
		-exec cp -pr $(shell realpath {}) $(BASEINSTALLDIR)/ \;

install: install-zynthian-webconf
	rm -rf $(BASEINSTALLDIR)/metaheader/node_modules
