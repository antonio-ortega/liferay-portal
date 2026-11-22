/**
 * SPDX-FileCopyrightText: (c) 2026 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

import {TSort} from '@liferay/frontend-data-set-web';
import {useCallback, useMemo, useState} from 'react';

import {getSubtasks} from '../../../../../utils/api';
import {ITask, ITaskItemsActionsTask} from '../../../../../utils/types';

export type TreeTask = ITask & {children?: TreeTask[]; id: number};

function applyTaskUpdate(
	treeTask: TreeTask,
	update: ITaskItemsActionsTask
): TreeTask {

	// The object entry API returns the task without the nested fields of the
	// search API, so keep the parent and the subtasks.

	return {
		...treeTask,
		actions: update.actions ?? treeTask.actions,
		embedded: {
			...(update.embedded as unknown as ITask['embedded']),
			cmpTaskToCMPTasks: treeTask.embedded.cmpTaskToCMPTasks,
			r_cmpProjectToCMPTasks_c_cmpProject:
				treeTask.embedded.r_cmpProjectToCMPTasks_c_cmpProject,
			r_cmpTaskToCMPTasks_c_cmpTask:
				treeTask.embedded.r_cmpTaskToCMPTasks_c_cmpTask,
		},
	};
}

function toTreeTask(task: ITask): TreeTask {

	// Rows loaded outside the data set keep their permissions under
	// "embedded", so copy them where the renderers and actions read them.

	return {
		...task,
		actions: task.actions ?? task.embedded.actions,
		id: task.embedded.id,
	};
}

/**
 * Builds the tree from the data set items (the top-level tasks), the
 * subtasks loaded on expand, and the tasks updated by row actions.
 */
export default function useTaskTree({
	apiURL,
	items,
	sorts,
}: {
	apiURL: string;
	items: ITask[];
	sorts?: TSort[];
}) {
	const [subtasksByTaskId, setSubtasksByTaskId] = useState(
		new Map<number, ITask[]>()
	);
	const [updatesByTaskId, setUpdatesByTaskId] = useState(
		new Map<number, ITaskItemsActionsTask>()
	);

	const treeTasks = useMemo(() => {
		const buildTreeTasks = (tasks: ITask[]): TreeTask[] =>
			tasks.map((task) => {
				const subtasks = subtasksByTaskId.get(task.embedded.id);
				const update = updatesByTaskId.get(task.embedded.id);

				const treeTask = update
					? applyTaskUpdate(toTreeTask(task), update)
					: toTreeTask(task);

				return subtasks
					? {...treeTask, children: buildTreeTasks(subtasks)}
					: treeTask;
			});

		return buildTreeTasks(items);
	}, [items, subtasksByTaskId, updatesByTaskId]);

	const loadSubtasks = useCallback(
		async (task: ITask) => {
			const {data, error} = await getSubtasks({
				apiURL,
				parentTaskId: task.embedded.id,
				sorts,
			});

			if (!data) {
				throw new Error(error);
			}

			setSubtasksByTaskId((subtasksByTaskId) =>
				new Map(subtasksByTaskId).set(task.embedded.id, data.items)
			);

			return data.items.map(toTreeTask);
		},
		[apiURL, sorts]
	);

	const updateTask = useCallback(
		(update: ITaskItemsActionsTask) =>
			setUpdatesByTaskId((updatesByTaskId) =>
				new Map(updatesByTaskId).set(update.embedded.id, update)
			),
		[]
	);

	return {loadSubtasks, treeTasks, updateTask};
}
