# -*- coding: utf-8 -*-
#********************************************************************
# ZYNTHIAN PROJECT: Zynthian Web Configurator
#
# Dashboard Handler
#
# Copyright (C) 2018 Fernando Moyano <jofemodo@zynthian.org>
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
import sys
import logging
import tornado.web
import apt
from subprocess import check_output, DEVNULL
from distutils import util
from collections import OrderedDict

from lib.zynthian_config_handler import ZynthianBasicHandler

sys.path.append(os.environ.get('ZYNTHIAN_UI_DIR'))
import zynconf

#------------------------------------------------------------------------------
# Dashboard Handler
#------------------------------------------------------------------------------

class DashboardHandler(ZynthianBasicHandler):

    @tornado.web.authenticated
    def get(self):
        self.apt_cache = apt.cache.Cache()
        self.apt_cache.open()

        # Get git info
        git_info_zyncoder=self.get_git_info("", apt_package_name="zyncoder")
        git_info_ui=self.get_git_info("", apt_package_name="zynthbox-qml")
        git_info_webconf=self.get_git_info("", apt_package_name="zynthian-webconf")
        git_info_libzynthbox=self.get_git_info("", apt_package_name="libzynthbox")
        git_info_sys=self.get_git_info("", apt_package_name="zynthian-sys")
        git_info_data=self.get_git_info("", apt_package_name="zynthian-data")

        self.apt_cache.close()

        # Get Memory & SD Card info
        ram_info=self.get_ram_info()
        sd_info=self.get_sd_info()

        # Get build info
        build_info = self.get_build_info()

        config=OrderedDict([
            ['HARDWARE', {
                #'icon': 'glyphicon glyphicon-wrench',
                'icon': 'glyphicon glyphicon-cog',
                'info': OrderedDict([
                    ['RBPI_VERSION', {
                        'title': os.environ.get('RBPI_VERSION')
                    }],
                    ['SOUNDCARD_NAME', {
                        'title': 'Soundcard',
                        'value': os.environ.get('SOUNDCARD_NAME'),
                        'url': "/hw-audio"
                    }],
                    ['DISPLAY_NAME', {
                        'title': 'Display',
                        'value': os.environ.get('DISPLAY_NAME'),
                        'url': "/hw-display"
                    }],
                    ['WIRING_LAYOUT', {
                        'title': 'Wiring',
                        'value': os.environ.get('ZYNTHIAN_WIRING_LAYOUT'),
                        'url': "/hw-wiring"
                    }]
                    # ['GPIO_EXPANDER', {
                    #     'title': 'GPIO Expander',
                    #     'value': self.get_gpio_expander(),
                    #     'url': "/hw-wiring"
                    # }]
                ])
            }],
            ['SYSTEM', {
                #'icon': 'glyphicon glyphicon-dashboard',
                'icon': 'glyphicon glyphicon-tasks',
                'info': OrderedDict([
                    ['OS_INFO', {
                        'title': "{}".format(self.get_os_info())
                    }],
                    ['BUILD_DATE', {
                        'title': 'Build Date',
                        'value': build_info['Build Date'],
                    }],
                    ['BUILD_VERSION', {
                        'title': 'Build Version',
                        'value': build_info['Build Version'] if 'Build Version' in build_info else "RC",
                    }],
                    ['RAM', {
                        'title': 'Memory',
                        'value': "{} ({}/{})".format(ram_info['usage'],ram_info['used'],ram_info['total'])
                    }],
                    ['SD CARD', {
                        'title': 'SD Card',
                        'value': "{} ({}/{})".format(sd_info['usage'],sd_info['used'],sd_info['total'])
                    }],
                    ['TEMPERATURE', {
                        'title': 'Temperature',
                        'value': self.get_temperature()
                    }]
                ])
            }],
            ['MIDI', {
                'icon': 'glyphicon glyphicon-music',
                'info': OrderedDict([
                    ['PROFILE', {
                        'title': 'Profile',
                        'value': os.path.basename(os.environ.get('ZYNTHIAN_SCRIPT_MIDI_PROFILE',"")),
                        'url': "/ui-midi-options"
                    }],
                    ['FINE_TUNING', {
                        'title': 'Fine Tuning',
                        'value': "{} Hz".format(os.environ.get('ZYNTHIAN_MIDI_FINE_TUNING',"440")),
                        'url': "/ui-midi-options"
                    }],
                    ['MASTER_CHANNEL', {
                        'title': 'Master Channel',
                        'value': self.get_midi_master_chan(),
                        'url': "/ui-midi-options"
                    }],
                    ['SINGLE_ACTIVE_CHANNEL', {
                        'title': 'Single Active Channel',
                        'value': self.bool2onoff(os.environ.get('ZYNTHIAN_MIDI_SINGLE_ACTIVE_CHANNEL','0')),
                        'url': "/ui-midi-options"
                    }],
                    ['ZS3_SUBSNAPSHOTS', {
                        'title': 'ZS3 SubSnapShots',
                        'value': self.bool2onoff(os.environ.get('ZYNTHIAN_MIDI_PROG_CHANGE_ZS3','1')),
                        'url': "/ui-midi-options"
                    }]
                ])
            }],
            ['SOFTWARE', {
                'icon': 'glyphicon glyphicon-random',
                'info': OrderedDict([
                    ['ZYNCODER', {
                        'title': 'zyncoder',
                        'value': git_info_zyncoder['gitid'],
                        'url': '#'
                    }],
                    ['UI', {
                        'title': 'zynthbox-qml',
                        'value': git_info_ui['gitid'],
                        'url': '#'
                    }],
                    ['LIBZYNTHBOX', {
                        'title': 'libzynthbox',
                        'value': git_info_libzynthbox['gitid'],
                        'url': '#'
                    }],
                    ['SYS', {
                        'title': 'zynthian-sys',
                        'value': git_info_sys['gitid'],
                        'url': '#'
                    }],
                    ['DATA', {
                        'title': 'zynthian-data',
                        'value': git_info_data['gitid'],
                        'url': '#'
                    }],
                    ['WEBCONF', {
                        'title': 'zynthian-webconf',
                        'value': git_info_webconf['gitid'],
                        'url': '#'
                    }]
                ])
            }],
            ['LIBRARY', {
                'icon': 'glyphicon glyphicon-book',
                'info': OrderedDict([
                    ['SNAPSHOTS', {
                        'title': 'Snapshots',
                        'value': str(self.get_num_of_files(os.environ.get('ZYNTHIAN_MY_DATA_DIR')+"/snapshots")),
                        'url': "/lib-snapshot"
                    }],
                    ['USER_PRESETS', {
                        'title': 'User Presets',
                        'value': str(self.get_num_of_presets(os.environ.get('ZYNTHIAN_MY_DATA_DIR')+"/presets")),
                        'url': "/lib-presets"
                    }],
                    ['USER_SOUNDFONTS', {
                        'title': 'User Soundfonts',
                        'value': str(self.get_num_of_files(os.environ.get('ZYNTHIAN_MY_DATA_DIR')+"/soundfonts")),
                        'url': "/lib-soundfont"
                    }],
                    ['AUDIO_CAPTURES', {
                        'title': 'Audio Captures',
                        'value': str(self.get_num_of_files(os.environ.get('ZYNTHIAN_MY_DATA_DIR')+"/capture","*.wav")),
                        'url': "/lib-captures"
                    }],
                    ['MIDI_CAPTURES', {
                        'title': 'MIDI Captures',
                        'value': str(self.get_num_of_files(os.environ.get('ZYNTHIAN_MY_DATA_DIR')+"/capture","*.mid")),
                        'url': "/lib-captures"
                    }]
                ])
            }],
            ['NETWORK', {
                'icon': 'glyphicon glyphicon-link',
                'info': OrderedDict([
                    ['HOSTNAME', {
                        'title': 'Hostname',
                        'value': self.get_host_name(),
                        'url': "/sys-security"
                    }],
                    ['WIFI', {
                        'title': 'Wifi',
                        'value': zynconf.get_current_wifi_mode(),
                        'url': "/sys-wifi"
                    }],
                    ['IP', {
                        'title': 'IP',
                        'value': self.get_ip(),
                        'url': "/sys-wifi"
                    }],
                    ['RTPMIDI', {
                        'title': 'RTP-MIDI',
                        'value': self.bool2onoff(self.is_service_active("jackrtpmidid")),
                        'url': "/ui-midi-options"
                    }],
                    ['QMIDINET', {
                        'title': 'QMidiNet',
                        'value': self.bool2onoff(self.is_service_active("qmidinet")),
                        'url': "/ui-midi-options"
                    }]
                ])
            }]
        ])

        media_usb0_info = self.get_media_info('/media/usb0')
        if media_usb0_info:
            config['SYSTEM']['info']['MEDIA_USB0'] = {
                'title': "USB Storage",
                'value': "{} ({}/{})".format(media_usb0_info['usage'],media_usb0_info['used'],media_usb0_info['total']),
                'url': "/lib-captures"
            }

        if self.is_service_active("touchosc2midi"):
            config['NETWORK']['info']['TOUCHOSC'] = {
                'title': 'TouchOSC',
                'value': 'on',
                'url': "/ui-midi-options"
            }

        super().get("dashboard_block.html", "Dashboard", config, None)


    def get_git_info(self, path, check_updates=False, apt_package_name=None):
        apt_package = None

        if apt_package_name is not None:
            try:
                if self.apt_cache[apt_package_name].is_installed:
                    apt_package = self.apt_cache[apt_package_name]
            except:
                logging.error(f"Apt package {apt_package_name} not found")

        try:
            if apt_package is not None:
                branch = "deb"
                gitid = apt_package.installed.version
                update = None
            else:
                branch = check_output("cd %s; git branch | grep '*'" % path, shell=True).decode()[2:-1]
                gitid = check_output("cd %s; git rev-parse HEAD" % path, shell=True).decode()[:-1]
                if check_updates:
                    update = check_output("cd %s; git remote update; git status --porcelain -bs | grep behind | wc -l" % path, shell=True).decode()
                else:
                    update = None
        except:
            # Handle any error caused while fetching information
            branch = "unknown"
            gitid = ""
            update = None
        return { "branch": branch, "gitid": gitid, "update": update }


    def get_host_name(self):
        with open("/etc/hostname") as f:
            hostname=f.readline()
            return hostname
        return ""


    def get_os_info(self):
        return check_output("lsb_release -ds", shell=True).decode()


    def get_build_info(self):
        info = {}
        try:
            zynthian_dir = os.environ.get('ZYNTHIAN_DIR',"/zynthian")
            with open(zynthian_dir + "/build_info.txt", 'r') as f:
                rows = f.read().split("\n")
                f.close()
                for row in rows:
                    try:
                        k,v = row.split(": ")
                        info[k] = v
                        logging.debug("Build info => {}: {}".format(k,v))
                    except:
                        pass
        except Exception as e:
            logging.warning("Can't get build info! => {}".format(e))

            # The file /etc/apt/trusted.gpg.d/microsoft.gpg is touched every build. Newer image builds will contain the build_info.txt file
            # If build_info is not found (for example in old images), display the last modified date of this file instead if possible
            try:
                info['Build Date'] = check_output("stat --format='%z' /etc/apt/trusted.gpg.d/microsoft.gpg", shell=True).decode().split(" ")[0]
            except:
                info['Build Date'] = '???'
            info['Build Version'] = 'RC'

        return info


    def get_ip(self):
        #out=check_output("hostname -I | cut -f1 -d' '", shell=True).decode()
        out=check_output("hostname -I", shell=True).decode()
        return out


    def get_gpio_expander(self):
        try:
            out=check_output("gpio i2cd", shell=True).decode().split("\n")
            if len(out)>3 and out[3].startswith("20: 20"):
                out2 = check_output("i2cget -y 1 0x20 0x10", shell=True).decode().strip()
                if out2=='0x00':
                    return "MCP23008"
                else:
                    return "MCP23017"
        except:
            pass
        return "Not detected"


    def get_ram_info(self):
        out=check_output("free -m | grep 'Mem'", shell=True).decode()
        parts=re.split('\s+', out)
        return { 'total': parts[1]+"M", 'used': parts[2]+"M", 'free': parts[3]+"M", 'usage': "{}%".format(int(100*float(parts[2])/float(parts[1]))) }


    def get_temperature(self):
        try:
            return check_output("vcgencmd measure_temp", shell=True).decode()[5:-3] + "ºC"
        except:
            return "???"


    def get_volume_info(self, volume='/dev/root'):
        try:
            out=check_output("df -h | grep '{}'".format(volume), shell=True).decode()
            parts=re.split('\s+', out)
            return { 'total': parts[1], 'used': parts[2], 'free': parts[3], 'usage': parts[4] }
        except:
            return { 'total': 'NA', 'used': 'NA', 'free': 'NA', 'usage': 'NA' }


    def get_sd_info(self):
        return self.get_volume_info('/dev/mmcblk0p2')


    def get_media_info(self, mpath="/media/usb0"):
        try:
            out=check_output("mountpoint '{}'".format(mpath), shell=True).decode()
            if out.startswith("{} is a mountpoint".format(mpath)):
                return self.get_volume_info(mpath)
            else:
                return None
        except Exception as e:
            #logging.error("Can't get info for '{}' => {}".format(mpath,e))
            pass


    def get_num_of_files(self, path, pattern=None):
        if pattern:
            pattern = "-name \"{}\"".format(pattern)
        else:
            pattern = ""
        n=check_output("find {} -type f -follow {} | wc -l".format(path, pattern), shell=True).decode()
        return n


    def get_num_of_presets(self, path):
        # LV2 presets
        n1 = int(check_output("find {}/lv2 -type f -prune -name manifest.ttl | wc -l".format(path), shell=True).decode())
        logging.debug("LV2 presets => {}".format(n1))
        # Pianoteq presets
        n2 = int(check_output("find {}/pianoteq -type f -prune | wc -l".format(path), shell=True).decode())
        logging.debug("Pianoteq presets => {}".format(n2))
        # Puredata presets
        n3 = int(check_output("find {}/puredata/*/* -type d -prune | wc -l".format(path), shell=True, stderr=DEVNULL).decode())
        logging.debug("Puredata presets => {}".format(n3))
        # ZynAddSubFX presets
        n4 = int(check_output("find {}/zynaddsubfx -type f -name *.xiz | wc -l".format(path), shell=True).decode())
        logging.debug("ZynAddSubFX presets => {}".format(n4))
        return n1 + n2 + n3 + n4


    def get_midi_master_chan(self):
        mmc = os.environ.get('ZYNTHIAN_MIDI_MASTER_CHANNEL',"16")
        if int(mmc)==0:
            return "off"
        else:
            return mmc


    def is_service_active(self, service):
        cmd="systemctl is-active %s" % service
        try:
            result=check_output(cmd, shell=True).decode('utf-8','ignore')
        except Exception as e:
            result="ERROR: %s" % e
        #print("Is service "+str(service)+" active? => "+str(result))
        if result.strip()=='active': return True
        else: return False


    @staticmethod
    def bool2onoff(b):
        if (isinstance(b, str) and util.strtobool(b)) or (isinstance(b, bool) and b):
            return "on"
        else:
            return "off"

