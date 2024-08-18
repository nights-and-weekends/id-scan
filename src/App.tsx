import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAtom } from "jotai";
import { atomWithStorage } from "jotai/utils";
import { useState } from "react";
import { Scanner } from "@yudiel/react-qr-scanner";
import { CSVLink } from "react-csv";

type UserData = {
  venue: string;
  programName: string;
  attendees: {
    regNo: string;
    timestamp: string;
  }[];
}[];

const userDataAtom = atomWithStorage<UserData>("user-data", []);

export default function App() {
  const [venue, setVenue] = useState("");
  const [programName, setProgramName] = useState("");
  const [userData, setUserData] = useAtom(userDataAtom);
  const [scan, setScan] = useState(false);

  if (scan) {
    return (
      <div>
        <Button onClick={() => setScan(false)}>Close</Button>
        <Scanner
          onScan={(barcodes) => {
            const regNo = barcodes[0].rawValue;
            console.log(regNo);
            const updated = userData.map((record) => {
              if (
                record.programName === programName &&
                record.venue === venue
              ) {
                return {
                  ...record,
                  attendees: [
                    ...record.attendees,
                    {
                      regNo,
                      timestamp: new Date().toISOString(),
                    },
                  ],
                } satisfies UserData[number];
              } else {
                return record;
              }
            });
            setUserData(updated);
            setScan(false);
          }}
          onError={(e) => console.error(e)}
          scanDelay={300}
        />
      </div>
    );
  }

  return (
    <main>
      <div>
        <Input
          placeholder="Venue"
          value={venue}
          onChange={(e) => setVenue(e.target.value)}
        />
        <Input
          placeholder="Program Name"
          value={programName}
          onChange={(e) => setProgramName(e.target.value)}
        />
        <Button
          onClick={() => {
            setScan(true);
            if (
              !userData.some(
                (obj) => obj.venue === venue && obj.programName === programName
              )
            ) {
              setUserData([
                ...userData,
                {
                  programName,
                  venue,
                  attendees: [],
                },
              ]);
            }
          }}
        >
          Scan
        </Button>
        {scan && <video id="scan-show" className="size-96" />}
      </div>

      <hr className="border-b-black h-1 border-b-2" />
      {userData.map((data) => (
        <CSVLink
          data={[
            ["SN", "Timestamp", "Registration Number"],
            ...data.attendees.map((attendee, i) => [
              (i + 1).toString(),
              attendee.timestamp,
              attendee.regNo,
            ]),
          ]}
          filename={`${data.programName} - ${data.venue}.csv`}
        >
          Export as CSV - "{data.programName} - {data.venue}.csv" (
          {data.attendees.length} attendees)
        </CSVLink>
      ))}
    </main>
  );
}
