/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Red Hat, Inc. All rights reserved.
 *  Copyright (c) Adam Voss. All rights reserved.
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
'use strict';

import {
  createConnection,
  IConnection,
  ProposedFeatures,
} from 'vscode-languageserver';
import * as nls from 'vscode-nls';
import { schemaRequestHandler, workspaceContext } from './languageservice/services/schemaRequestHandler';
import { YAMLServerInit } from './yamlServerInit';
import { SettingsState } from './yamlSettings';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
nls.config(process.env['VSCODE_NLS_CONFIG'] as any);

// Create a connection for the server.
let connection: IConnection = null;

if (process.argv.indexOf('--stdio') === -1) {
  connection = createConnection(ProposedFeatures.all);
} else {
  connection = createConnection();
}

console.log = connection.console.log.bind(connection.console);
console.error = connection.console.error.bind(connection.console);

const yamlSettings = new SettingsState();

/**
 * Handles schema content requests given the schema URI
 * @param uri can be a local file, vscode request, http(s) request or a custom request
 */
const schemaRequestHandlerWrapper = (connection: IConnection, uri: string): Promise<string> => {
  return schemaRequestHandler(connection, uri, yamlSettings.workspaceFolders, yamlSettings.workspaceRoot, yamlSettings.useVSCodeContentRequest);
};

const schemaRequestService = schemaRequestHandlerWrapper.bind(this, connection);

new YAMLServerInit(connection, yamlSettings, workspaceContext, schemaRequestService).start();
