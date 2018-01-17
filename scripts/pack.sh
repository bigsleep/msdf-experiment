#!/bin/bash

stack exec ImagePacker -- -s512,512 -m'[{"metadataType":"scripts/jsonobject.ede","metadataValues":{"outputDirectory":"src","filename":"metadata","extension":".json"}}]' msdfs resources
