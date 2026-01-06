# -*- coding: utf-8 -*-
#********************************************************************
# ZYNTHIAN PROJECT: Zynthian Web Configurator
#
# Wiring Configuration Handler
#
# Copyright (C) 2017 Fernando Moyano <jofemodo@zynthian.org>
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

import os
import tornado.web
import logging
from collections import OrderedDict
from subprocess import check_output
from enum import Enum

from zynconf import CustomSwitchActionType, CustomUiAction, ZynSensorActionType
from lib.zynthian_config_handler import ZynthianConfigHandler

#------------------------------------------------------------------------------
# Wiring Configuration
#------------------------------------------------------------------------------


class WiringConfigHandler(ZynthianConfigHandler):

    wiring_presets=[
        "AUTO_DETECT",
        "Z2_V4",
        "Z2_V5",
        "DUMMIES"
    ]

    @tornado.web.authenticated
    def get(self, errors=None):

        config=OrderedDict()

        if os.environ.get('ZYNTHIAN_KIT_VERSION')!='Custom':
            custom_options_disabled = True
            config['ZYNTHIAN_MESSAGE'] = {
                'type': 'html',
                'content': "<div class='alert alert-warning'>Some config options are disabled. You may want to <a href='/hw-kit'>choose Custom Kit</a> for enabling all options.</div>"
            }
        else:
            custom_options_disabled = False

        config['FORCED_ZYNTHIAN_WIRING_LAYOUT'] = {
            'type': 'select',
            'title': 'Wiring Layout',
            'value': os.environ.get('FORCED_ZYNTHIAN_WIRING_LAYOUT', 'AUTO_DETECT'),
            'options': self.wiring_presets,
            'disabled': custom_options_disabled
        }

        super().get("Wiring", config, errors)


    @tornado.web.authenticated
    def post(self):
        command = self.get_argument('_command', '')
        logging.info("COMMAND = {}".format(command))
        postedConfig = tornado.escape.recursive_unicode(self.request.arguments)
        if command=='REFRESH':
            errors = None
            self.config_env(postedConfig)
        else:
            errors = self.update_config(postedConfig)
            if not self.reboot_flag:
                self.restart_ui_flag = True

        self.get(errors)

