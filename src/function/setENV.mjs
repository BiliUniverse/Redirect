import { Lodash as _, getStorage, Console } from "@nsnanocat/util";

/**
 * Set Environment Variables
 * @author VirgilClyne
 * @param {String} name - Persistent Store Key
 * @param {Array} platforms - Platform Names
 * @param {Object} database - Default DataBase
 * @return {Object} { Settings, Caches, Configs }
 */
export default function setENV(name, platforms, database) {
	Console.info("☑️ Set Environment Variables");
	const { Settings, Caches, Configs } = getStorage(name, platforms, database);
	/***************** Settings *****************/
	Console.debug(`Settings: ${typeof Settings}, Settings内容: ${JSON.stringify(Settings)}`);
	/***************** Caches *****************/
	//Console.debug(`Caches: ${typeof Caches}, Caches内容: ${JSON.stringify(Caches)}`);
	/***************** Configs *****************/
	Console.info("✅ Set Environment Variables");
	return { Settings, Caches, Configs };
};
