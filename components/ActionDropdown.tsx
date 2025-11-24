"use client";

import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useState } from "react";
import Image from "next/image";
import { Models } from "node-appwrite";
import { actionsDropdownItems } from "@/constants";
import Link from "next/link";
import { constructDownloadUrl } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  deleteFile,
  renameFile,
  updateFileUsers,
} from "@/lib/actions/file.actions";
import { usePathname } from "next/navigation";
import { FileDetails, ShareInput } from "@/components/ActionsModalContent";

import { checkUserExists } from "@/lib/actions/checkUser";

const ActionDropdown = ({ file }: { file: Models.Document }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [action, setAction] = useState<ActionType | null>(null);
  const [name, setName] = useState(file.name);
  const [isLoading, setIsLoading] = useState(false);
  const [emails, setEmails] = useState<string[]>([]);
  const [errorMessage, setErrorMessage] = useState("");

  const path = usePathname();

  const closeAllModals = () => {
    setIsModalOpen(false);
    setIsDropdownOpen(false);
    setAction(null);
    setName(file.name);
    setEmails([]);
    setErrorMessage("");
  };

  const handleAction = async () => {
    if (!action) return;
    setIsLoading(true);

    let success = false;

    const actions = {
      rename: () =>
        renameFile({ fileId: file.$id, name, extension: file.extension, path }),

      share: () => updateFileUsers({ fileId: file.$id, emails, path }),

      delete: () =>
        deleteFile({
          fileId: file.$id,
          bucketFileId: file.bucketFileId,
          path,
        }),
    };

    success = await actions[action.value as keyof typeof actions]();

    if (success) closeAllModals();
    setIsLoading(false);
  };

  const handleShareInput = async (list: string[]) => {
    setErrorMessage("");

    const cleanedList = list
      .map((e) => e.trim().toLowerCase())
      .filter((e) => e !== "");

    if (cleanedList.length === 0) return;

    const newValidEmails: string[] = [];
    const errors: string[] = [];

    for (const email of cleanedList) {
      if (emails.includes(email) || file.users.includes(email)) {
        errors.push(`Email "${email}" sudah ditambahkan.`);
        continue;
      }

      const exists = await checkUserExists(email);

      if (!exists) {
        errors.push(`Email "${email}" tidak terdaftar.`);
        continue;
      }

      newValidEmails.push(email);
    }

    if (errors.length > 0) {
      setErrorMessage(errors.join(" | "));
    }

    if (newValidEmails.length > 0) {

      setEmails((prev) => [...prev, ...newValidEmails]);

      file.users.push(...newValidEmails);

      await updateFileUsers({
        fileId: file.$id,
        emails: [...file.users],
        path,
      });
    }
  };

  const handleRemoveUser = async (email: string) => {
    const updated = emails.filter((e) => e !== email);

    const success = await updateFileUsers({
      fileId: file.$id,
      emails: updated,
      path,
    });

    if (success) setEmails(updated);
    closeAllModals();
  };

  const renderDialogContent = () => {
    if (!action) return null;

    const { value, label } = action;

    return (
      <DialogContent className="shad-dialog button">
        <DialogHeader className="flex flex-col gap-3">
          <DialogTitle className="text-center text-light-100">
            {label}
          </DialogTitle>

          {value === "rename" && (
            <Input value={name} onChange={(e) => setName(e.target.value)} />
          )}

          {value === "details" && <FileDetails file={file} />}

          {value === "share" && (
            <ShareInput
              file={file}
              onInputChange={handleShareInput}
              onRemove={handleRemoveUser}
              errorMessage={errorMessage}
            />
          )}

          {value === "delete" && (
            <p className="delete-confirmation">
              Are you sure you want to delete{" "}
              <span className="delete-file-name">{file.name}</span>?
            </p>
          )}
        </DialogHeader>

        {["rename", "delete", "share"].includes(value) && (
          <DialogFooter className="flex flex-col gap-3 md:flex-row">
            <Button onClick={closeAllModals} className="modal-cancel-button">
              Cancel
            </Button>

            <Button onClick={handleAction} className="modal-submit-button">
              <p className="capitalize">{value}</p>
              {isLoading && (
                <Image
                  src="/assets/icons/loader.svg"
                  alt="loader"
                  width={24}
                  height={24}
                  className="animate-spin"
                />
              )}
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    );
  };

  return (
    <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
      <DropdownMenu open={isDropdownOpen} onOpenChange={setIsDropdownOpen}>
        <DropdownMenuTrigger className="shad-no-focus">
          <Image src="/assets/icons/dots.svg" width={34} height={34} alt="dots" />
        </DropdownMenuTrigger>

        <DropdownMenuContent>
          <DropdownMenuLabel>{file.name}</DropdownMenuLabel>
          <DropdownMenuSeparator />

          {actionsDropdownItems.map((item) => (
            <DropdownMenuItem
              key={item.value}
              className="shad-dropdown-item"
              onClick={() => {
                setAction(item);
                if (["rename", "share", "delete", "details"].includes(item.value)) {
                  setIsModalOpen(true);
                }
              }}
            >
              {item.value === "download" ? (
                <Link
                  href={constructDownloadUrl(file.bucketFileId)}
                  download={file.name}
                  className="flex items-center gap-2"
                >
                  <Image src={item.icon} width={30} height={30} alt={item.label} />
                  {item.label}
                </Link>
              ) : (
                <div className="flex items-center gap-2">
                  <Image src={item.icon} width={30} height={30} alt={item.label} />
                  {item.label}
                </div>
              )}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      {renderDialogContent()}
    </Dialog>
  );
};

export default ActionDropdown;
