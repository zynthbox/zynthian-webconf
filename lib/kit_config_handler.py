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
import subprocess
from collections import OrderedDict
from pathlib import Path
from datetime import datetime

from lib.zynthian_config_handler import ZynthianConfigHandler
from lib.audio_config_handler import soundcard_presets
from lib.display_config_handler import DisplayConfigHandler
from lib.wiring_config_handler import WiringConfigHandler

#------------------------------------------------------------------------------
# Kit Configuration
#------------------------------------------------------------------------------

class KitConfigHandler(ZynthianConfigHandler):

    kit_options = [
        'AUTO_DETECT',
        'Z2_V4',
        'Z2_V5',
        'Custom'
    ]

    @tornado.web.authenticated
    def get(self, errors=None):
        config=OrderedDict([
            ['FORCED_ZYNTHIAN_KIT_VERSION', {
                'type': 'select',
                'title': 'Kit',
                'value': os.environ.get("FORCED_ZYNTHIAN_KIT_VERSION", "AUTO_DETECT"),
                'options': self.kit_options
            }]
        ])

        super().get("Kit", config, errors)


    @tornado.web.authenticated
    def post(self):
        postedConfig = tornado.escape.recursive_unicode(self.request.arguments)
        errors={}
        errors = self.configure_kit(postedConfig)
        self.reboot_flag = True
        self.get(errors)


    def configure_kit(self, pconfig):
        errors = None
        kit_version = pconfig['FORCED_ZYNTHIAN_KIT_VERSION'][0]

        # If Custom kit is selected, populate users env with the current kit defaults
        if kit_version == "Custom":
            # Fetch soundcard name and display name from current kit's default envars file
            detected_kit = subprocess.run(['python', '/zynthian/zynthian-sys/sbin/detect_zynthbox_kit.py'], capture_output=True, text=True, check=True).stdout.strip()
            kit_envars_file = Path(f"/zynthian/zynthian-sys/config/envars/zynthian_envars_{detected_kit}.sh")
            if kit_envars_file.exists():
                data = kit_envars_file.read_text()
                soundcard_match = re.search(r'export SOUNDCARD_NAME="(.+)"', data)
                display_match = re.search(r'export DISPLAY_NAME="(.+)"', data)

                # Write soundcard and display config to user env
                if soundcard_match is not None and display_match is not None:
                    soundcard_name = soundcard_match.group(1)
                    display_name = display_match.group(1)

                    if soundcard_name in soundcard_presets:
                        pconfig['SOUNDCARD_NAME']=[soundcard_name]
                        for k,v in soundcard_presets[soundcard_name].items():
                            pconfig[k]=[v]
                    else:
                        logging.error(f"Soundcard {soundcard_name} not found")

                    if display_name in DisplayConfigHandler.display_presets:
                        pconfig['DISPLAY_NAME']=[display_name]
                        for k,v in DisplayConfigHandler.display_presets[display_name].items():
                            pconfig[k]=[v]
                    else:
                        logging.error(f"Display {display_name} not found")
        else:
            # If any other kit is selected, back up existing users env and remove to reset overridden values
            user_envars_file = Path("/zynthian/config/zynthian_envars.user.sh")
            if user_envars_file.exists() and len(user_envars_file.read_text().strip()) > 0:
                # Back up user envars file if it exists and has some content
                user_envars_file.rename(f"/zynthian/config/zynthian_envars_{datetime.now().strftime('%Y%m%dT%H%M%S')}.user.sh")

        errors = self.update_config(pconfig)

        return errors
