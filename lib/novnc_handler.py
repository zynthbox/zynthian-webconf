# -*- coding: utf-8 -*-
#********************************************************************
# ZYNTHIAN PROJECT: Zynthian Web Configurator
#
# NoVNC Handler
#
# Copyright (C) 2026 Anupam Basak <anupam.basak27@gmail.com>
#
#********************************************************************
#
# This program is free software; you can redistribute it and/or
# modify it under the terms of the GNU General Public License as
# published by the Free Software Foundation; either version 2 of
# the License, or any later version.
#
# This program is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
# GNU General Public License for more details.
#
# For a full copy of the GNU General Public License see the LICENSE.txt file.
#
#********************************************************************

import tornado.web

from lib.zynthian_config_handler import ZynthianBasicHandler
from subprocess import check_output

#------------------------------------------------------------------------------
# Zynterm Handler
#------------------------------------------------------------------------------

class NoVNCHandler(ZynthianBasicHandler):
    @tornado.web.authenticated
    def get(self):
        config = {
            "xstatic": self.application.settings['xstatic_url'],
        }
        # Start vnc services if not already started
        check_output("systemctl start vncserver0.service novnc0.service", shell=True)

        super().get("novnc.html", "NoVNC", config, None)
