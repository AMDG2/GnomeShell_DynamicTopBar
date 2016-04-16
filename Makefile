#
# Build system for specification
#

SRC_DIR=dynamicTopBar@gnomeshell.feildel.fr

LOCALE_DIR=${SRC_DIR}/locale
LOCALES_FILE=$(wildcard ${LOCALE_DIR}/*/LC_MESSAGES/dynamicTopBar.po)

SCHEMA_DIR=${SRC_DIR}/schemas
SCHEMA_FILE=org.gnome.shell.extensions.dynamic-top-bar.gschema.xml

all: zip

zip: translations schema
	cd "${SRC_DIR}" && zip -r ../DynamicTopBar.zip *

translations: ${LOCALES_FILE}
	msgfmt "${LOCALE_DIR}/cs/LC_MESSAGES/dynamicTopBar.po" -o "${LOCALE_DIR}/cs/LC_MESSAGES/dynamicTopBar.mo"
	msgfmt "${LOCALE_DIR}/de/LC_MESSAGES/dynamicTopBar.po" -o "${LOCALE_DIR}/de/LC_MESSAGES/dynamicTopBar.mo"
	msgfmt "${LOCALE_DIR}/fr/LC_MESSAGES/dynamicTopBar.po" -o "${LOCALE_DIR}/fr/LC_MESSAGES/dynamicTopBar.mo"
	msgfmt "${LOCALE_DIR}/pl/LC_MESSAGES/dynamicTopBar.po" -o "${LOCALE_DIR}/pl/LC_MESSAGES/dynamicTopBar.mo"
	msgfmt "${LOCALE_DIR}/pt_BR/LC_MESSAGES/dynamicTopBar.po" -o "${LOCALE_DIR}/pt_BR/LC_MESSAGES/dynamicTopBar.mo"

schema: ${SCHEMA_DIR}/${SCHEMA_FILE}
	glib-compile-schemas "${SCHEMA_DIR}"
