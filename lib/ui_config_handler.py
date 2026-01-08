# -*- coding: utf-8 -*-
#********************************************************************
# ZYNTHIAN PROJECT: Zynthian Web Configurator
#
# UI Configuration Handler
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
import logging
import tornado.web
from collections import OrderedDict

from lib.zynthian_config_handler import ZynthianConfigHandler

#------------------------------------------------------------------------------
# UI Configuration
#------------------------------------------------------------------------------

class UiConfigHandler(ZynthianConfigHandler):
    @tornado.web.authenticated
    def get(self, errors=None):
        config=OrderedDict([
            ['ZYNTHIAN_UI_SWITCH_BOLD_MS', {
                'type': 'text',
                'title': 'Bold Push Time (ms)',
                'value': os.environ.get('ZYNTHIAN_UI_SWITCH_BOLD_MS', '300'),
                'advanced': True
            }],
            ['ZYNTHIAN_UI_SWITCH_LONG_MS', {
                'type': 'text',
                'title': 'Long Push Time (ms)',
                'value': os.environ.get('ZYNTHIAN_UI_SWITCH_LONG_MS', '2000'),
                'advanced': True
            }],
            ['ZYNTHIAN_UI_METER_SELECTION', {
                'type': 'select',
                'title': 'Meter',
                'value':  'CPU Usage' if os.environ.get('ZYNTHIAN_UI_SHOW_CPU_STATUS')=='1' else 'Audio Level',
                'options': ['Audio Level', 'CPU Usage'],
                'option_labels': {
                    'Audio Level': 'Audio Level',
                    'CPU Usage': 'CPU Usage', # these option_labels are2 needed, because otherwise 'Cpu Usage' is generatted
                }
            }],
            ['ZYNTHIAN_UI_SNAPSHOT_MIXER_SETTINGS', {
                'type': 'boolean',
                'title': 'Audio Levels on Snapshots',
                'value': os.environ.get('ZYNTHIAN_UI_SNAPSHOT_MIXER_SETTINGS', '0')
            }]
        ])

        super().get("User Interface", config, errors)


    @tornado.web.authenticated
    def post(self):
        self.request.arguments['ZYNTHIAN_UI_SNAPSHOT_MIXER_SETTINGS'] = self.request.arguments.get('ZYNTHIAN_UI_SNAPSHOT_MIXER_SETTINGS', '0')

        escaped_arguments = tornado.escape.recursive_unicode(self.request.arguments)

        if escaped_arguments['ZYNTHIAN_UI_METER_SELECTION'][0]=='CPU Usage':
            escaped_arguments['ZYNTHIAN_UI_SHOW_CPU_STATUS'] = '1'
        else:
            escaped_arguments['ZYNTHIAN_UI_SHOW_CPU_STATUS'] = '0'

        del escaped_arguments['ZYNTHIAN_UI_METER_SELECTION']

        errors=self.update_config(escaped_arguments)

        self.restart_ui_flag = True
        self.get(errors)
