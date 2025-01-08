# -*- coding: utf-8 -*-
#********************************************************************
# ZYNTHIAN PROJECT: Zynthian Web Configurator
#
# Audio Configuration Handler
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
import re
import logging
import tornado.web
from collections import OrderedDict
from subprocess import check_output, call

from lib.zynthian_config_handler import ZynthianConfigHandler
from lib.audio_config_handler import soundcard_presets
from lib.display_config_handler import DisplayConfigHandler
from lib.wiring_config_handler import WiringConfigHandler

#------------------------------------------------------------------------------
# Kit Configuration
#------------------------------------------------------------------------------

class KitConfigHandler(ZynthianConfigHandler):

    kit_options = [
        'Z1_V1',
        'Custom'
    ]

    @tornado.web.authenticated
    def get(self, errors=None):

        config=OrderedDict([
            ['ZYNTHIAN_KIT_VERSION', {
                'type': 'select',
                'title': 'Kit',
                'value': os.environ.get('ZYNTHIAN_KIT_VERSION', 'Z1_V1'),
                'options': self.kit_options
            }]
        ])

        super().get("Kit", config, errors)


    @tornado.web.authenticated
    def post(self):
        postedConfig = tornado.escape.recursive_unicode(self.request.arguments)
        current_kit_version = os.environ.get('ZYNTHIAN_KIT_VERSION')

        errors={}
        if postedConfig['ZYNTHIAN_KIT_VERSION'][0]!=current_kit_version:
            errors = self.configure_kit(postedConfig)
            self.reboot_flag = True

        self.get(errors)


    def configure_kit(self, pconfig):
        kit_version = pconfig['ZYNTHIAN_KIT_VERSION'][0]
        if kit_version!="Custom":
            if kit_version in ("Z1_V1"):
                soundcard_name = "Z1 ADAC"
                display_name = "Z1 Display"
                wiring_layout = "Z1_V1"
                wiring_layout_custom_profile = "Z1_V1"
                ui_font_size = "16"

            pconfig['SOUNDCARD_NAME']=[soundcard_name]
            for k,v in soundcard_presets[soundcard_name].items():
                pconfig[k]=[v]

            pconfig['DISPLAY_NAME']=[display_name]
            for k,v in DisplayConfigHandler.display_presets[display_name].items():
                pconfig[k]=[v]

            pconfig['ZYNTHIAN_WIRING_LAYOUT']=[wiring_layout]
            for k,v in WiringConfigHandler.wiring_presets[wiring_layout].items():
                pconfig[k]=[v]

        errors = self.update_config(pconfig)
        DisplayConfigHandler.delete_fb_splash()
        WiringConfigHandler.rebuild_zyncoder()
        
        return errors
