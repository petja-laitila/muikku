import { useState, useEffect } from "react";
import { deleteAudio } from "../handlers/recordings-list";
import { RecordValue } from "../../../../@types/recorder";

/**
 * useRecordingsList
 * @param records
 * @returns
 */
export default function useRecordingsList(records: RecordValue[] | null) {
  const [recordings, setRecordings] = useState<RecordValue[]>([]);

  useEffect(() => {
    if (records.length !== recordings.length) {
      setRecordings([...records]);
    }
  }, [records]);

  return {
    recordings,
    deleteAudio: (audioKey: string) => deleteAudio(audioKey, setRecordings),
  };
}
